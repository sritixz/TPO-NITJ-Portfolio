import Offer from "../models/offer.js";
import PlacementRegistration from "../models/placement-registration.js";
import Student from "../models/user_model/student.js";
import axios from "axios";
import { encryptValue, decryptValue } from "../utils/security.js";
import JobProfile from "../models/jobprofile.js";
import Internship from "../models/internship.js"; // for getOfferInsights company count
import SummerIntern from "../models/summer_internship.js"; // ← correct model for summer intern insights

const parseCTC = (ctc) => {
  if (!ctc) return 0;
  const numeric = parseFloat(ctc.replace(/[^0-9.]/g, ""));
  return isNaN(numeric) ? 0 : numeric;
};

const getCTCBucket = (ctc) => {
  if (ctc < 5) return "<5";
  if (ctc >= 5 && ctc < 12) return "5-12";
  if (ctc >= 12 && ctc < 20) return "12-20";
  if (ctc >= 20 && ctc < 30) return "20-30";
  if (ctc >= 30 && ctc < 40) return "30-40";
  return "40+";
};

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// ─── Placement Insights ───────────────────────────────────────────────────────

export const getOfferInsights = async (req, res) => {
  try {
    const { course, batch, companyFilter } = req.query;
    let query = { visibility: true };
    if (course) query.course = course;
    if (batch) query.batch = batch;
    const offers = await Offer.find(query).sort({ result_date: 1 });

    const companyQuery = { visibility: true };
    const SummerCompanyQuery = { visibility: true };

    if (batch) companyQuery.batch = batch;
    if (companyFilter && companyFilter !== "All")
      companyQuery.course = companyFilter;
    if (batch) SummerCompanyQuery.batch = String(Number(batch) + 1);
    if (companyFilter && companyFilter !== "All")
      SummerCompanyQuery.course = companyFilter;

    const normalizeCompany = (name = "") =>
      name.toLowerCase().trim().replace(/\s+/g, " ").replace(/\.$/, "");

    const companyData = await Offer.find(companyQuery);
    const summerInternData = await SummerIntern.find(SummerCompanyQuery); // ← fixed

    const normalisedSummerCompanies = new Set(
      summerInternData.map((o) => normalizeCompany(o.company_name)),
    );
    const normalizedCompanies = new Set(
      companyData.map((o) => normalizeCompany(o.company_name)),
    );
    const offCampusCompanies = new Set(
      companyData
        .filter((o) => o.offer_mode === "Off-Campus")
        .map((o) => normalizeCompany(o.company_name)),
    );

    const pendingCompanyQuery = { visibility: true, pending: true };
    if (batch || (companyFilter && companyFilter !== "All")) {
      pendingCompanyQuery.eligibility_criteria = {
        $elemMatch: {
          ...(batch && { eligible_batch: batch }),
          ...(companyFilter &&
            companyFilter !== "All" && { course_allowed: companyFilter }),
        },
      };
    }
    const pendingCompanies = await JobProfile.find(pendingCompanyQuery);
    const totalCompanies =
      normalizedCompanies.size +
      normalisedSummerCompanies.size +
      pendingCompanies.length;
    const offCampusCount = offCampusCompanies.size;
    const onCampusCount =
      totalCompanies - offCampusCount - normalisedSummerCompanies.size;

    if (!offers.length)
      return res.status(404).json({ message: "No offers found" });

    const allStudents = offers.flatMap(
      (offer) => offer.shortlisted_students || [],
    );
    const placedStudentIds = new Set(
      allStudents.map((s) => s.studentId?.toString()).filter(Boolean),
    );

    const interestedQuery = { interested: true };
    if (course) interestedQuery.course = course;
    if (batch) interestedQuery.batch = batch;
    const interestedStudents =
      await PlacementRegistration.find(interestedQuery);

    const studentIds = interestedStudents
      .map((s) => s.studentId)
      .filter(Boolean);
    let students = [];
    if (studentIds.length > 0) {
      students = await Student.find({ _id: { $in: studentIds } });
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const staleStudents = students.filter(
        (s) => !s.erpLastUpdated || s.erpLastUpdated < thirtyDaysAgo,
      );
      const staleRollNumbers = staleStudents
        .map((s) => s.rollno)
        .filter(Boolean);
      if (staleRollNumbers.length > 0) {
        const rollNumberChunks = chunkArray(staleRollNumbers, 100);
        const erpPromises = rollNumberChunks.map((chunk) => {
          const payload = {
            rollNumbers: chunk,
            portalKey: process.env.ERP_IDENTITY_SECRET,
          };
          const encryptedData = encryptValue(JSON.stringify(payload));
          return axios
            .post(`${process.env.ERP_SERVER}`, encryptedData)
            .then(
              (response) => JSON.parse(decryptValue(response.data.data)) || [],
            )
            .catch((error) => {
              console.error(`ERP error:`, error.message);
              return [];
            });
        });
        try {
          const allErpResults = await Promise.all(erpPromises);
          const allErpStudents = allErpResults.flat();
          const updates = [];
          allErpStudents.forEach((erpStudent) => {
            const targetStudent = students.find(
              (s) => s.rollno === erpStudent.rollno,
            );
            if (targetStudent) {
              targetStudent.cgpa = parseFloat(erpStudent.cgpa || 0);
              targetStudent.active_backlogs =
                erpStudent.active_backlogs === "true";
              targetStudent.erpLastUpdated = new Date();
              updates.push({
                updateOne: {
                  filter: { _id: targetStudent._id },
                  update: {
                    $set: {
                      cgpa: targetStudent.cgpa,
                      active_backlogs: targetStudent.active_backlogs,
                      erpLastUpdated: targetStudent.erpLastUpdated,
                    },
                  },
                },
              });
            }
          });
          if (updates.length > 0) await Student.bulkWrite(updates);
        } catch (error) {
          console.error("ERP batch error:", error.message);
        }
      }
    }

    const eligibleStudents = interestedStudents
      .map((pr) => {
        const student = students.find(
          (s) => s._id.toString() === pr.studentId.toString(),
        );
        if (!student) return null;
        const cgpa = parseFloat(student.cgpa ?? 0);
        const active_backlogs = student.active_backlogs ?? false;
        const placed = placedStudentIds.has(pr.studentId.toString());
        if (placed || (cgpa >= 6 && !active_backlogs))
          return { ...pr.toObject(), student, cgpa, active_backlogs };
        return null;
      })
      .filter(Boolean);

    let matchStage = { visibility: true };
    if (course) matchStage.course = course;
    if (batch) matchStage.batch = batch;
    const topCompaniesByCTC = await Offer.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$company_name",
          max_ctc: { $max: "$ctc" },
          avg_ctc: { $avg: "$ctc" },
          totalOffers: { $sum: 1 },
        },
      },
      { $sort: { max_ctc: -1 } },
      { $limit: 5 },
    ]);

    const offersByDate = {};
    offers.forEach((offer) => {
      if (!offer.result_date) return;
      const dateKey = offer.result_date.toISOString().split("T")[0];
      offersByDate[dateKey] =
        (offersByDate[dateKey] || 0) +
        (offer?.shortlisted_students?.length || 0);
    });
    let runningTotal = 0;
    const offersVsDate = Object.entries(offersByDate)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => {
        runningTotal += count;
        return { date, count: runningTotal };
      });

    const map = new Map();
    allStudents.forEach((s, idx) => {
      const id = s?.studentId
        ? s.studentId.toString()
        : `${s?.name || "unknown"}_${idx}`;
      map.set(id, (map.get(id) || 0) + 1);
    });
    const totalPlacements = allStudents.length;
    const uniquePlacements = map.size;
    const doublePlacements = [...map.values()].filter((v) => v > 1).length;
    const avgCTC =
      allStudents.reduce((sum, s) => sum + parseCTC(s.ctc), 0) /
        (totalPlacements || 1) || 0;

    const ctcs = allStudents
      .map((s) => parseFloat(s.ctc))
      .filter((v) => !isNaN(v) && v !== 0);
    ctcs.sort((a, b) => a - b);
    const mid = Math.floor(ctcs.length / 2);
    const median =
      ctcs.length % 2 !== 0 ? ctcs[mid] : (ctcs[mid - 1] + ctcs[mid]) / 2;
    const medianCTC = ctcs.length ? median.toFixed(2) : "N/A";

    const highestCTC = allStudents.reduce(
      (max, s) => Math.max(max, parseCTC(s.ctc)),
      0,
    );
    const validCTCs = allStudents
      .map((s) => parseCTC(s.ctc))
      .filter((ctc) => ctc > 0);
    const lowestCTC = validCTCs.length ? Math.min(...validCTCs) : 0;

    const ctcBuckets = {
      "<5": 0,
      "5-12": 0,
      "12-20": 0,
      "20-30": 0,
      "30-40": 0,
      "40+": 0,
    };
    allStudents.forEach((s) => {
      ctcBuckets[getCTCBucket(parseCTC(s.ctc))] += 1;
    });

    const genderDist = {},
      genderUnique = {},
      genderStudentMap = {};
    allStudents.forEach((s, idx) => {
      const g = s.gender || "Unknown";
      genderDist[g] = (genderDist[g] || 0) + 1;
      const id = s?.studentId
        ? s.studentId.toString()
        : `${s?.name || "unknown"}_${idx}`;
      if (!genderStudentMap[g]) genderStudentMap[g] = new Set();
      genderStudentMap[g].add(id);
    });
    Object.entries(genderStudentMap).forEach(([g, set]) => {
      genderUnique[g] = set.size;
    });

    const placementsByCategory = {};
    if (!course || course === "ALL") {
      offers.forEach((offer) => {
        const courseKey = offer.course || "Unknown";
        placementsByCategory[courseKey] =
          (placementsByCategory[courseKey] || 0) +
          offer.shortlisted_students.length;
      });
    } else {
      allStudents.forEach((s) => {
        const dept = s.department || "Unknown";
        placementsByCategory[dept] = (placementsByCategory[dept] || 0) + 1;
      });
    }

    const categoryDist = {},
      jobTypeDist = {};
    offers.forEach((offer) => {
      (offer.shortlisted_students || []).forEach((s) => {
        categoryDist[s.category || "Unknown"] =
          (categoryDist[s.category || "Unknown"] || 0) + 1;
        jobTypeDist[s.job_type || "Unknown"] =
          (jobTypeDist[s.job_type || "Unknown"] || 0) + 1;
      });
    });

    const sectorDist = {};
    offers.forEach((offer) => {
      sectorDist[offer.offer_sector || "Unknown"] =
        (sectorDist[offer.offer_sector || "Unknown"] || 0) +
        offer.shortlisted_students.length;
    });

    const companyOffers = {};
    offers.forEach((offer) => {
      companyOffers[offer.company_name || "Unknown"] =
        (companyOffers[offer.company_name || "Unknown"] || 0) +
        (offer?.shortlisted_students?.length || 0);
    });
    const topCompanies = Object.entries(companyOffers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));

    const totalEligibleStudents = eligibleStudents.length || 0;
    const overallPlacementPercentage = parseFloat(
      ((uniquePlacements / totalEligibleStudents) * 100).toFixed(2),
    );

    const deptMap = {};
    offers.forEach((offer) => {
      const sector = offer.offer_sector || "Unknown";
      const company = offer.company_name || "Unknown";
      const dateKey = offer.result_date
        ? offer.result_date.toISOString().split("T")[0]
        : null;
      (offer.shortlisted_students || []).forEach((student, idx) => {
        const dept = student.department || "Unknown";
        if (!deptMap[dept]) {
          deptMap[dept] = {
            totalOffers: 0,
            studentOfferCount: new Map(),
            ctcBuckets: {
              "<5": 0,
              "5-12": 0,
              "12-20": 0,
              "20-30": 0,
              "30-40": 0,
              "40+": 0,
            },
            jobTypeDist: {},
            categoryDist: {},
            industryDist: {},
            genderDist: {},
            genderUniqueMap: {},
            companyOffers: {},
            companyCTCAcc: {},
            ctcAcc: { sum: 0, count: 0 },
            maxCTC: 0,
            minCTC: Infinity,
            offersByDate: {},
          };
        }
        const D = deptMap[dept];
        D.totalOffers += 1;
        const sid = student?.studentId
          ? student.studentId.toString()
          : `${student?.name || "unknown"}_${idx}_${dept}`;
        D.studentOfferCount.set(sid, (D.studentOfferCount.get(sid) || 0) + 1);
        const ctcVal = parseCTC(student.ctc);
        D.ctcBuckets[getCTCBucket(ctcVal)] += 1;
        if (ctcVal > 0) {
          D.ctcAcc.sum += ctcVal;
          D.ctcAcc.count += 1;
          if (ctcVal > D.maxCTC) D.maxCTC = ctcVal;
          if (ctcVal < D.minCTC) D.minCTC = ctcVal;
        }
        const g = student.gender || "Unknown";
        D.genderDist[g] = (D.genderDist[g] || 0) + 1;
        if (!D.genderUniqueMap[g]) D.genderUniqueMap[g] = new Set();
        D.genderUniqueMap[g].add(sid);
        D.jobTypeDist[student.job_type || "Unknown"] =
          (D.jobTypeDist[student.job_type || "Unknown"] || 0) + 1;
        D.categoryDist[student.category || "Unknown"] =
          (D.categoryDist[student.category || "Unknown"] || 0) + 1;
        D.industryDist[sector] = (D.industryDist[sector] || 0) + 1;
        D.companyOffers[company] = (D.companyOffers[company] || 0) + 1;
        if (!D.companyCTCAcc[company])
          D.companyCTCAcc[company] = { sum: 0, count: 0 };
        if (ctcVal > 0) {
          D.companyCTCAcc[company].sum += ctcVal;
          D.companyCTCAcc[company].count += 1;
        }
        if (dateKey)
          D.offersByDate[dateKey] = (D.offersByDate[dateKey] || 0) + 1;
      });
    });

    const departmentStats = {};
    Object.entries(deptMap).forEach(([dept, data]) => {
      const uniqueStudents = data.studentOfferCount.size;
      const eligibleStudentsCount =
        eligibleStudents.filter((es) => es.student.department === dept)
          .length || 1;
      const placementPercentage = parseFloat(
        ((uniqueStudents / eligibleStudentsCount) * 100).toFixed(2),
      );
      const multipleOfferCount = [...data.studentOfferCount.values()].filter(
        (v) => v > 1,
      ).length;
      let running = 0;
      const offersVsDate = Object.entries(data.offersByDate)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([date, count]) => {
          running += count;
          return { date, count: running };
        });
      const topByCount = Object.entries(data.companyOffers)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([company, count]) => ({ company, count }));
      const companyAvgCTCs = Object.entries(data.companyCTCAcc)
        .map(([company, acc]) => ({
          company,
          avgCTC: acc.count ? acc.sum / acc.count : 0,
        }))
        .filter((c) => c.avgCTC > 0)
        .sort((a, b) => b.avgCTC - a.avgCTC)
        .slice(0, 5)
        .map((c) => ({
          company: c.company,
          avgCTC: parseFloat(c.avgCTC.toFixed(2)),
        }));
      const deptAvgCTC = data.ctcAcc.count
        ? parseFloat((data.ctcAcc.sum / data.ctcAcc.count).toFixed(2))
        : 0;
      const genderUnique = {};
      Object.entries(data.genderUniqueMap).forEach(([g, set]) => {
        genderUnique[g] = set.size;
      });
      departmentStats[dept] = {
        totalOffers: data.totalOffers,
        eligibleStudents: eligibleStudentsCount,
        uniqueStudents,
        multipleOffers: multipleOfferCount,
        avgCTC: deptAvgCTC,
        highestCTC: data.maxCTC,
        lowestCTC: data.minCTC === Infinity ? 0 : data.minCTC,
        placementPercentage,
        genderDist: data.genderDist,
        genderUnique,
        ctcBuckets: data.ctcBuckets,
        jobTypeDist: data.jobTypeDist,
        categoryDist: data.categoryDist,
        industryDist: data.industryDist,
        topCompaniesByCount: topByCount,
        topCompaniesByAvgCTC: companyAvgCTCs,
        offersVsDate,
      };
    });

    const insights = {
      offersVsDate,
      totalPlacements,
      uniquePlacements,
      doublePlacements,
      avgCTC: parseFloat(avgCTC.toFixed(2)),
      highestCTC: parseFloat(highestCTC.toFixed(2)),
      lowestCTC: isFinite(lowestCTC) ? parseFloat(lowestCTC.toFixed(2)) : 0,
      medianCTC,
      placementsByDepartment: placementsByCategory,
      ctcBuckets,
      genderDist,
      genderUnique,
      categoryDist,
      jobTypeDist,
      sectorDist,
      topCompanies,
      topCompaniesByCTC,
      totalOffers: offers.length,
      totalCompanies,
      summerTotalCompanies: normalisedSummerCompanies.size,
      pendingCompanies: pendingCompanies.length,
      offCampusCompanies: offCampusCount,
      onCampusCompanies: onCampusCount,
      totalEligibleStudents,
      overallPlacementPercentage,
      filterApplied: course && course !== "ALL" ? course : "All Courses",
      departmentStats,
    };

    insights.topCompaniesByCTC = topCompaniesByCTC.map((c) => ({
      company: c._id,
      maxCTC: c.max_ctc,
      avgCTC: c.avg_ctc,
      totalOffers: c.totalOffers,
    }));

    res.json(insights);
  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─── Summer Intern Insights ───────────────────────────────────────────────────

export const getSummerInternInsights = async (req, res) => {
  try {
    const { course, batch } = req.query;

    // SummerIntern model uses 'course' (not 'degree')
    let query = { visibility: true };
    if (course) query.course = course;
    if (batch) query.batch = batch;

    const summerOffers = await SummerIntern.find(query).sort({
      result_date: 1,
    });

    if (!summerOffers.length) {
      return res.status(404).json({ message: "No offers found" });
    }

    // ── Stipend helpers ──────────────────────────────────────────────────────
    // Stipend is stored per-student in SummerIntern model
    // If value > 1000 it's stored in full rupees → convert to K
    const parseStipend = (stipend) => {
      if (!stipend) return 0;
      const numeric = parseFloat(String(stipend).replace(/[^0-9.]/g, ""));
      if (isNaN(numeric)) return 0;
      return numeric > 1000 ? parseFloat((numeric / 1000).toFixed(2)) : numeric;
    };

    const getStipendBucket = (val) => {
      if (val <= 0) return "Unpaid/Unknown";
      if (val < 10) return "<10K";
      if (val < 20) return "10-20K";
      if (val < 40) return "20-40K";
      if (val < 60) return "40-60K";
      return "60K+";
    };

    // ── Flatten all students ─────────────────────────────────────────────────
    const allStudents = summerOffers.flatMap((offer) =>
      (offer.shortlisted_students || []).map((s) => ({
        ...s.toObject(),
        company: offer.company_name || "Unknown",
        result_date: offer.result_date,
      })),
    );

    // ── Global counts ────────────────────────────────────────────────────────
    const studentMap = new Map();
    allStudents.forEach((s, idx) => {
      const id = s?.studentId
        ? s.studentId.toString()
        : `${s?.name || "unknown"}_${idx}`;
      studentMap.set(id, (studentMap.get(id) || 0) + 1);
    });

    const totalOffers = allStudents.length;
    const uniqueStudents = studentMap.size;

    const doubleOfferSet = new Set();

    studentMap.forEach((count, id) => {
      if (count > 1) {
        doubleOfferSet.add(id);
      }
    });

    const doubleOffers = doubleOfferSet.size;

    // ── Stipend stats — per student ──────────────────────────────────────────
    const validStipends = allStudents
      .map((s) => parseStipend(s.stipend || s.ctc))
      .filter((v) => v > 0);

    const avgStipend = validStipends.length
      ? parseFloat(
          (
            validStipends.reduce((a, b) => a + b, 0) / validStipends.length
          ).toFixed(2),
        )
      : 0;
    const highestStipend = validStipends.length
      ? Math.max(...validStipends)
      : 0;
    const lowestStipend = validStipends.length ? Math.min(...validStipends) : 0;

    const stipendBuckets = {
      "Unpaid/Unknown": 0,
      "<10K": 0,
      "10-20K": 0,
      "20-40K": 0,
      "40-60K": 0,
      "60K+": 0,
    };
    allStudents.forEach((s) => {
      const bucket = getStipendBucket(parseStipend(s.stipend || s.ctc));
      stipendBuckets[bucket] = (stipendBuckets[bucket] || 0) + 1;
    });

    // ── Offers vs date (cumulative) ──────────────────────────────────────────
    const offersByDate = {};
    summerOffers.forEach((offer) => {
      if (!offer.result_date) return;
      const key = offer.result_date.toISOString().split("T")[0];
      offersByDate[key] =
        (offersByDate[key] || 0) + (offer.shortlisted_students?.length || 0);
    });
    let running = 0;
    const offersVsDate = Object.entries(offersByDate)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => {
        running += count;
        return { date, count: running };
      });

    // ── Gender distribution ──────────────────────────────────────────────────
    const genderDist = {},
      genderUniqueMap = {};
    allStudents.forEach((s, idx) => {
      const g = s.gender || "Unknown";
      const id = s?.studentId
        ? s.studentId.toString()
        : `${s?.name || "unknown"}_${idx}`;
      genderDist[g] = (genderDist[g] || 0) + 1;
      if (!genderUniqueMap[g]) genderUniqueMap[g] = new Set();
      genderUniqueMap[g].add(id);
    });
    const genderUnique = {};
    Object.entries(genderUniqueMap).forEach(([g, set]) => {
      genderUnique[g] = set.size;
    });

    // ── Top companies by offer count ─────────────────────────────────────────
    const companyOfferCount = {};
    summerOffers.forEach((offer) => {
      const company = offer.company_name || "Unknown";
      companyOfferCount[company] =
        (companyOfferCount[company] || 0) +
        (offer.shortlisted_students?.length || 0);
    });
    const topCompanies = Object.entries(companyOfferCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));

    // ── Top companies by stipend — per student ───────────────────────────────
    const companyStipendMap = {};
    allStudents.forEach((s) => {
      const company = s.company || "Unknown";
      const val = parseStipend(s.stipend || s.ctc);
      if (val > 0) {
        companyStipendMap[company] = Math.max(
          companyStipendMap[company] || 0,
          val,
        );
      }
    });
    const topCompaniesByStipend = Object.entries(companyStipendMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([company, maxStipend]) => ({ company, maxStipend }));

    // ── Flat company list ────────────────────────────────────────────────────
    const companies = [
      ...new Set(summerOffers.map((o) => o.company_name).filter(Boolean)),
    ].sort();

    // ── Eligible students for placement % ───────────────────────────────────
    const interestedQuery = { interested: true };
    if (course) interestedQuery.course = course;
    if (batch) interestedQuery.batch = batch;
    const interestedStudents =
      await PlacementRegistration.find(interestedQuery);
    const totalEligible = interestedStudents.length || 1;
    const overallPercentage = parseFloat(
      ((uniqueStudents / totalEligible) * 100).toFixed(2),
    );

    // ── Department-level stats ───────────────────────────────────────────────
    const deptMap = {};

    allStudents.forEach((student, idx) => {
      const dept = student.department || "Unknown";
      const company = student.company || "Unknown";
      const dateKey = student.result_date
        ? new Date(student.result_date).toISOString().split("T")[0]
        : null;

      if (!deptMap[dept]) {
        deptMap[dept] = {
          totalOffers: 0,
          studentOfferCount: new Map(),
          stipendAcc: { sum: 0, count: 0 },
          maxStipend: 0,
          minStipend: Infinity,
          stipendBuckets: {
            "Unpaid/Unknown": 0,
            "<10K": 0,
            "10-20K": 0,
            "20-40K": 0,
            "40-60K": 0,
            "60K+": 0,
          },
          genderDist: {},
          genderUniqueMap: {},
          companyOffers: {},
          companyStipendMap: {},
          offersByDate: {},
        };
      }

      const D = deptMap[dept];
      const sid = student?.studentId
        ? student.studentId.toString()
        : `${student?.name || "unknown"}_${idx}_${dept}`;

      D.totalOffers += 1;
      D.studentOfferCount.set(sid, (D.studentOfferCount.get(sid) || 0) + 1);

      // Stipend per student
      const sVal = parseStipend(student.stipend || student.ctc);
      const bucket = getStipendBucket(sVal);
      D.stipendBuckets[bucket] = (D.stipendBuckets[bucket] || 0) + 1;
      if (sVal > 0) {
        D.stipendAcc.sum += sVal;
        D.stipendAcc.count += 1;
        if (sVal > D.maxStipend) D.maxStipend = sVal;
        if (sVal < D.minStipend) D.minStipend = sVal;
      }

      // Gender
      const g = student.gender || "Unknown";
      D.genderDist[g] = (D.genderDist[g] || 0) + 1;
      if (!D.genderUniqueMap[g]) D.genderUniqueMap[g] = new Set();
      D.genderUniqueMap[g].add(sid);

      // Company
      D.companyOffers[company] = (D.companyOffers[company] || 0) + 1;
      if (sVal > 0) {
        D.companyStipendMap[company] = Math.max(
          D.companyStipendMap[company] || 0,
          sVal,
        );
      }

      // Date
      if (dateKey) D.offersByDate[dateKey] = (D.offersByDate[dateKey] || 0) + 1;
    });

    // Finalize department stats
    const departmentStats = {};
    Object.entries(deptMap).forEach(([dept, data]) => {
      const unique = data.studentOfferCount.size;
      const multiple = [...data.studentOfferCount.values()].filter(
        (v) => v > 1,
      ).length;

      const eligibleInDept =
        interestedStudents.filter((s) => s.department === dept).length || 1;
      const internshipPercentage = parseFloat(
        ((unique / eligibleInDept) * 100).toFixed(2),
      );

      const deptGenderUnique = {};
      Object.entries(data.genderUniqueMap).forEach(([g, set]) => {
        deptGenderUnique[g] = set.size;
      });

      const deptCompanies = [
        ...new Set(Object.keys(data.companyOffers)),
      ].sort();

      departmentStats[dept] = {
        totalOffers: data.totalOffers,
        uniqueStudents: unique,
        multipleOffers: multiple,
        internshipPercentage,
        placementPercentage: internshipPercentage, // alias for frontend chart
        avgStipend: data.stipendAcc.count
          ? parseFloat((data.stipendAcc.sum / data.stipendAcc.count).toFixed(2))
          : 0,
        highestStipend: data.maxStipend,
        lowestStipend: data.minStipend === Infinity ? 0 : data.minStipend,
        stipendBuckets: data.stipendBuckets,
        genderDist: data.genderDist,
        genderUnique: deptGenderUnique,
        companies: deptCompanies,
      };
    });

    res.json({
      // counts — aliased both ways so frontend works
      totalPlacements: totalOffers,
      totalOffers,
      uniquePlacements: uniqueStudents,
      uniqueStudents,
      doublePlacements: doubleOffers,
      doubleOffers,
      // stipend
      avgStipend,
      highestStipend,
      lowestStipend,
      stipendBuckets,
      // timeline + distributions
      offersVsDate,
      genderDist,
      genderUnique,
      // companies
      topCompanies,
      topCompaniesByStipend,
      companies,
      // dept
      departmentStats,
      totalEligibleStudents: totalEligible,
      overallPlacementPercentage: overallPercentage,
    });
  } catch (error) {
    console.error("Error generating summer intern insights:", error);
    res.status(500).json({ message: error.message });
  }
};
