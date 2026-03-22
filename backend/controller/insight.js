// import Offer from '../models/offer.js';
// import PlacementRegistration from '../models/placement-registration.js'; // ✅ new import

// const parseCTC = (ctc) => {
//   if (!ctc) return 0;
//   const numeric = parseFloat(ctc.replace(/[^0-9.]/g, ''));
//   return isNaN(numeric) ? 0 : numeric;
// };

// const getCTCBucket = (ctc) => {
//   if (ctc < 5) return '<5';
//   if (ctc >= 5 && ctc < 12) return '5-12';
//   if (ctc >= 12 && ctc < 20) return '12-20';
//   if (ctc >= 20 && ctc < 30) return '20-30';
//   if (ctc >= 30 && ctc < 40) return '30-40';
//   return '40+';
// };

// export const getOfferInsights = async (req, res) => {
//   try {
//     const { course, batch } = req.query;
//     let query = { visibility: true };
//     if (course) query.course = course;
//     if (batch) query.batch = batch;

//     const offers = await Offer.find(query).sort({ result_date: 1 });

//     if (!offers.length) {
//       return res.status(404).json({ message: 'No offers found' });
//     }

//     const allStudents = offers.flatMap(offer => offer.shortlisted_students || []);

//     // 🔹 Fetch interested (eligible) students
//     const interestedQuery = { interested: true };
//     if (course) interestedQuery.course = course;
//     if (batch) interestedQuery.batch = batch;

//     const interestedStudents = await PlacementRegistration.find(interestedQuery);
//     console.log(interestedStudents);

//     // Set of interested student IDs for quick lookup
//     const interestedStudentIds = new Set(
//       interestedStudents.map(s => s.studentId?.toString()).filter(Boolean)
//     );

//     // ----------------------------
//     // top company by ctc
//     // ----------------------------
//     const topCompaniesByCTC = await Offer.aggregate([
//       { $match: { course: course, batch: batch } },
//       {
//         $group: {
//           _id: "$company_name",
//           max_ctc: { $max: "$ctc" },
//           avg_ctc: { $avg: "$ctc" },
//           totalOffers: { $sum: 1 }
//         }
//       },
//       { $sort: { max_ctc: -1 } },
//       { $limit: 5 }
//     ]);

//     // 1️⃣ Offers vs Date
//     const offersByDate = {};
//     offers.forEach(offer => {
//       if (!offer.result_date) return;
//       const dateKey = offer.result_date.toISOString().split('T')[0];
//       offersByDate[dateKey] = (offersByDate[dateKey] || 0) + (offer?.shortlisted_students?.length || 0);
//     });
//     let runningTotal = 0;
//     const offersVsDate = Object.entries(offersByDate)
//       .sort((a, b) => new Date(a[0]) - new Date(b[0]))
//       .map(([date, count]) => {
//         runningTotal += count;
//         return { date, count: runningTotal };
//       });

//     // 2️⃣ Global placement stats
//     const map = new Map();
//     allStudents.forEach((s, idx) => {
//       const id = s?.studentId ? s.studentId.toString() : `${s?.name || 'unknown'}_${idx}`;
//       map.set(id, (map.get(id) || 0) + 1);
//     });

//     const totalPlacements = allStudents.length;
//     const uniquePlacements = map.size;
//     const doublePlacements = [...map.values()].filter(v => v > 1).length;

//     const avgCTC = allStudents.reduce((sum, student) => sum + parseCTC(student.ctc), 0) / (totalPlacements || 1) || 0;
//     const highestCTC = allStudents.reduce((max, student) => Math.max(max, parseCTC(student.ctc)), 0);
//     // const lowestCTC = allStudents.reduce((min, student) => Math.min(min, parseCTC(student.ctc)), Infinity);
//    // Filter out invalid or zero CTCs first
//    const validCTCs = allStudents
//   .map(s => parseCTC(s.ctc))
//   .filter(ctc => ctc > 0);

//    const lowestCTC = validCTCs.length ? Math.min(...validCTCs) : 0;

//     //  3. Overall CTC buckets
//     const ctcBuckets = { '<5': 0, '5-12': 0, '12-20': 0, '20-30': 0, '30-40': 0, '40+': 0 };
//     allStudents.forEach(student => {
//       const bucket = getCTCBucket(parseCTC(student.ctc));
//       ctcBuckets[bucket] = (ctcBuckets[bucket] || 0) + 1;
//     });

//     // 4. Gender distribution (offers + unique students)
// const genderDist = {}; // total offers per gender
// const genderUnique = {}; // unique students per gender
// const genderStudentMap = {}; // gender -> Set of studentIds

// allStudents.forEach((s, idx) => {
//   const g = s.gender || 'Unknown';
//   genderDist[g] = (genderDist[g] || 0) + 1;

//   const id = s?.studentId ? s.studentId.toString() : `${s?.name || 'unknown'}_${idx}`;
//   if (!genderStudentMap[g]) genderStudentMap[g] = new Set();
//   genderStudentMap[g].add(id);
// });

// // compute unique student counts
// Object.entries(genderStudentMap).forEach(([g, set]) => {
//   genderUnique[g] = set.size;
// });

//     // 5. Placements by course/department (existing logic)
//     const placementsByCategory = {};
//     if (!course || course === 'ALL') {
//       offers.forEach(offer => {
//         const courseKey = offer.course || 'Unknown';
//         const studentCount = offer.shortlisted_students.length;
//         placementsByCategory[courseKey] = (placementsByCategory[courseKey] || 0) + studentCount;
//       });
//     } else {
//       allStudents.forEach(student => {
//         const dept = student.department || 'Unknown';
//         placementsByCategory[dept] = (placementsByCategory[dept] || 0) + 1;
//       });
//     }

//     // 6. Category, jobType, sector (existing)
//     const categoryDist = {};
//     const jobTypeDist = {};
//     offers.forEach(offer => {
//       (offer.shortlisted_students || []).forEach(s => {
//         const cat = s.category || 'Unknown';
//         categoryDist[cat] = (categoryDist[cat] || 0) + 1;
//         const jt = s.job_type || 'Unknown';
//         jobTypeDist[jt] = (jobTypeDist[jt] || 0) + 1;
//       });
//     });

//     const sectorDist = {};
//     offers.forEach(offer => {
//       const sector = offer.offer_sector || 'Unknown';
//       const studentCount = offer.shortlisted_students.length;
//       sectorDist[sector] = (sectorDist[sector] || 0) + studentCount;
//     });

//     // 7. Companies with most offers (overall)
//     const companyOffers = {};
//     offers.forEach(offer => {
//       const company = offer.company_name || 'Unknown';
//       companyOffers[company] = (companyOffers[company] || 0) + (offer?.shortlisted_students?.length || 0);
//     });
//     const topCompanies = Object.entries(companyOffers)
//       .sort(([, a], [, b]) => b - a)
//       .slice(0, 5)
//       .map(([company, count]) => ({ company, count }));

//     // 🔹 Eligible (interested) & placement percentage
//     const totalEligibleStudents = interestedStudents.length || 0;
//     const overallPlacementPercentage = parseFloat(((uniquePlacements / totalEligibleStudents) * 100).toFixed(2));

//     // 3️⃣ Department-level stats
//     const deptMap = {};

//     offers.forEach(offer => {
//       const sector = offer.offer_sector || 'Unknown';
//       const company = offer.company_name || 'Unknown';
//       const dateKey = offer.result_date ? offer.result_date.toISOString().split('T')[0] : null;

//       (offer.shortlisted_students || []).forEach((student, idx) => {
//         const dept = student.department || 'Unknown';
//         if (!deptMap[dept]) {
//           deptMap[dept] = {
//             totalOffers: 0,
//             studentOfferCount: new Map(),
//             ctcBuckets: { '<5': 0, '5-12': 0, '12-20': 0, '20-30': 0, '30-40': 0, '40+': 0 },
//             jobTypeDist: {},
//             categoryDist: {},
//             industryDist: {},
//             genderDist: {},
//             genderUniqueMap: {},
//             companyOffers: {},
//             companyCTCAcc: {},
//             ctcAcc: { sum: 0, count: 0 },
//             maxCTC: 0,
//             minCTC: Infinity,
//             offersByDate: {}
//           };
//         }

//         const D = deptMap[dept];
//         D.totalOffers += 1;

//         const sid = student?.studentId ? student.studentId.toString() : `${student?.name || 'unknown'}_${idx}_${dept}`;
//         D.studentOfferCount.set(sid, (D.studentOfferCount.get(sid) || 0) + 1);

//         // CTC
//         const ctcVal = parseCTC(student.ctc);
//         const bucket = getCTCBucket(ctcVal);
//         D.ctcBuckets[bucket] = (D.ctcBuckets[bucket] || 0) + 1;
//         if (ctcVal > 0) {
//           D.ctcAcc.sum += ctcVal;
//           D.ctcAcc.count += 1;
//           if (ctcVal > D.maxCTC) D.maxCTC = ctcVal;
//           if (ctcVal < D.minCTC) D.minCTC = ctcVal;
//         }

//         // Gender
//         const g = student.gender || 'Unknown';
//         D.genderDist[g] = (D.genderDist[g] || 0) + 1;
//         if (!D.genderUniqueMap[g]) D.genderUniqueMap[g] = new Set();
//         D.genderUniqueMap[g].add(sid);

//         // Job type
//         const jt = student.job_type || 'Unknown';
//         D.jobTypeDist[jt] = (D.jobTypeDist[jt] || 0) + 1;

//         // Category
//         const cat = student.category || 'Unknown';
//         D.categoryDist[cat] = (D.categoryDist[cat] || 0) + 1;

//         // Industry
//         D.industryDist[sector] = (D.industryDist[sector] || 0) + 1;

//         // Company
//         D.companyOffers[company] = (D.companyOffers[company] || 0) + 1;

//         // Company avg CTC
//         if (!D.companyCTCAcc[company]) D.companyCTCAcc[company] = { sum: 0, count: 0 };
//         if (ctcVal > 0) {
//           D.companyCTCAcc[company].sum += ctcVal;
//           D.companyCTCAcc[company].count += 1;
//         }

//         // Offer by date
//         if (dateKey) {
//           D.offersByDate[dateKey] = (D.offersByDate[dateKey] || 0) + 1;
//         }
//       });
//     });

//     // Finalize per-department stats
//     const departmentStats = {};
//     Object.entries(deptMap).forEach(([dept, data]) => {
//       const uniqueStudents = data.studentOfferCount.size;
//       const eligibleStudents = interestedStudents.filter(s => s.department === dept).length || 1;

//       const placementPercentage = parseFloat(((uniqueStudents / eligibleStudents) * 100).toFixed(2));

//       const multipleOfferCount = [...data.studentOfferCount.values()].filter(v => v > 1).length;

//       let running = 0;
//       const offersVsDate = Object.entries(data.offersByDate)
//         .sort((a, b) => new Date(a[0]) - new Date(b[0]))
//         .map(([date, count]) => {
//           running += count;
//           return { date, count: running };
//         });

//       const topByCount = Object.entries(data.companyOffers)
//         .sort(([, a], [, b]) => b - a)
//         .slice(0, 5)
//         .map(([company, count]) => ({ company, count }));

//       const companyAvgCTCs = Object.entries(data.companyCTCAcc)
//         .map(([company, acc]) => ({ company, avgCTC: acc.count ? acc.sum / acc.count : 0 }))
//         .filter(c => c.avgCTC > 0)
//         .sort((a, b) => b.avgCTC - a.avgCTC)
//         .slice(0, 5)
//         .map(c => ({ company: c.company, avgCTC: parseFloat(c.avgCTC.toFixed(2)) }));

//       const deptAvgCTC = data.ctcAcc.count ? parseFloat((data.ctcAcc.sum / data.ctcAcc.count).toFixed(2)) : 0;

//       const genderUnique = {};
//       Object.entries(data.genderUniqueMap).forEach(([g, set]) => {
//         genderUnique[g] = set.size;
//       });

//       departmentStats[dept] = {
//         totalOffers: data.totalOffers,
//         eligibleStudents, // ✅ total eligible in department
//         uniqueStudents,
//         multipleOffers: multipleOfferCount,
//         avgCTC: deptAvgCTC,
//         highestCTC: data.maxCTC,
//         lowestCTC: data.minCTC === Infinity ? 0 : data.minCTC,
//         placementPercentage, // ✅ new field
//         genderDist: data.genderDist,
//         genderUnique,
//         ctcBuckets: data.ctcBuckets,
//         jobTypeDist: data.jobTypeDist,
//         categoryDist: data.categoryDist,
//         industryDist: data.industryDist,
//         topCompaniesByCount: topByCount,
//         topCompaniesByAvgCTC: companyAvgCTCs,
//         offersVsDate
//       };
//     });

//     const insights = {
//       offersVsDate,
//       totalPlacements,
//       uniquePlacements,
//       doublePlacements,
//       avgCTC: parseFloat(avgCTC.toFixed(2)),
//       highestCTC: parseFloat(highestCTC.toFixed(2)),
//       lowestCTC: isFinite(lowestCTC) ? parseFloat(lowestCTC.toFixed(2)) : 0,
//        placementsByDepartment: placementsByCategory,
//       ctcBuckets,
//       genderDist,
//       genderUnique,
//       categoryDist,
//       jobTypeDist,
//       sectorDist,
//       topCompanies,
//       topCompaniesByCTC,
//       totalOffers: offers.length,
//       totalCompanies: new Set(offers.map(o => o.company_name)).size,
//       totalEligibleStudents, // ✅ overall eligible students
//       overallPlacementPercentage, // ✅ overall placement percentage
//       filterApplied: course && course !== 'ALL' ? course : 'All Courses',
//       departmentStats
//     };

//     insights.topCompaniesByCTC = topCompaniesByCTC.map(c => ({
//       company: c._id,
//       maxCTC: c.max_ctc,
//       avgCTC: c.avg_ctc,
//       totalOffers: c.totalOffers
//     }));

//     res.json(insights);
//   } catch (error) {
//     console.error("Error generating insights:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

import Offer from "../models/offer.js";
import PlacementRegistration from "../models/placement-registration.js";
import Student from "../models/user_model/student.js";
import axios from "axios";
import { encryptValue, decryptValue } from "../utils/security.js";
import JobProfile from "../models/jobprofile.js";
import SummerIntern from "../models/summer_internship.js";

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

// Helper function to chunk an array into smaller batches
const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

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

    // companyFilter applies ONLY here
    if (companyFilter && companyFilter !== "All") {
      companyQuery.course = companyFilter;
    }
    if (batch) SummerCompanyQuery.batch = String(Number(batch) + 1);

    if (companyFilter && companyFilter !== "All") {
      SummerCompanyQuery.course = companyFilter;
    }

    const normalizeCompany = (name = "") =>
      name.toLowerCase().trim().replace(/\s+/g, " ").replace(/\.$/, "");
    const companyData = await Offer.find(companyQuery);
    const summerInternData = await SummerIntern.find(SummerCompanyQuery);

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

    const pendingCompanyQuery = {
      visibility: true,
      pending: true,
    };

    if (batch || (companyFilter && companyFilter !== "All")) {
      pendingCompanyQuery.eligibility_criteria = {
        $elemMatch: {
          ...(batch && { eligible_batch: batch }),
          ...(companyFilter &&
            companyFilter !== "All" && {
              course_allowed: companyFilter,
            }),
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
    if (!offers.length) {
      return res.status(404).json({ message: "No offers found" });
    }
    const allStudents = offers.flatMap(
      (offer) => offer.shortlisted_students || [],
    );

    const placedStudentIds = new Set(
      allStudents.map((s) => s.studentId?.toString()).filter(Boolean),
    );
    //get total visited companies
    const jobProfile = await JobProfile.find();
    // 🔹 Fetch interested (eligible) students
    const interestedQuery = { interested: true };
    if (course) interestedQuery.course = course;
    if (batch) interestedQuery.batch = batch;

    const interestedStudents =
      await PlacementRegistration.find(interestedQuery);
    // Fetch corresponding Student documents to get rollno and department
    const studentIds = interestedStudents
      .map((s) => s.studentId)
      .filter(Boolean);
    let students = [];
    if (studentIds.length > 0) {
      students = await Student.find({ _id: { $in: studentIds } });
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      // Identify stale students (no erpLastUpdated or older than 30 days)
      const staleStudents = students.filter(
        (s) => !s.erpLastUpdated || s.erpLastUpdated < thirtyDaysAgo,
      );
      const staleRollNumbers = staleStudents
        .map((s) => s.rollno)
        .filter(Boolean);
      if (staleRollNumbers.length > 0) {
        // Batch ERP requests to parallelize and reduce per-request load
        const batchSize = 100; // Adjust based on ERP server limits/performance
        const rollNumberChunks = chunkArray(staleRollNumbers, batchSize);
        const erpPromises = rollNumberChunks.map((chunk) => {
          const payload = {
            rollNumbers: chunk,
            portalKey: process.env.ERP_IDENTITY_SECRET,
          };
          const encryptedData = encryptValue(JSON.stringify(payload));
          return axios
            .post(`${process.env.ERP_SERVER}`, encryptedData)
            .then((response) => {
              const erpChunk =
                JSON.parse(decryptValue(response.data.data)) || [];
              return erpChunk;
            })
            .catch((error) => {
              console.error(
                `Error fetching ERP data for batch starting with ${chunk[0]}:`,
                error.message,
              );
              return []; // Return empty array to continue with other batches
            });
        });
        // Execute all batches in parallel
        try {
          const allErpResults = await Promise.all(erpPromises);
          const allErpStudents = allErpResults.flat();
          // Update in-memory student objects and prepare bulk DB updates
          const updates = [];
          allErpStudents.forEach((erpStudent) => {
            const rollno = erpStudent.rollno;
            const targetStudent = students.find((s) => s.rollno === rollno);
            if (targetStudent) {
              // Update in-memory
              targetStudent.cgpa = parseFloat(erpStudent.cgpa || 0);
              targetStudent.active_backlogs =
                erpStudent.active_backlogs === "true";
              targetStudent.erpLastUpdated = new Date();
              // Prepare bulk update
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
          // Perform bulk update to DB
          if (updates.length > 0) {
            await Student.bulkWrite(updates);
          }
        } catch (error) {
          console.error(
            "Error in parallel ERP batch processing:",
            error.message,
          );
          // Continue without updating; fall back to existing data
        }
      }
    }
    // Filter to eligible students (CGPA >= 6 and no active backlogs)
    // Now uses updated in-memory student data directly

    const eligibleStudents = interestedStudents
      .map((pr) => {
        const student = students.find(
          (s) => s._id.toString() === pr.studentId.toString(),
        );
        if (!student) return null;
        const cgpa = parseFloat(student.cgpa ?? 0);
        const active_backlogs = student.active_backlogs ?? false;
        const placed = placedStudentIds.has(pr.studentId.toString());
        if (placed || (cgpa >= 6 && !active_backlogs)) {
          return { ...pr.toObject(), student, cgpa, active_backlogs };
        }
        return null;
      })
      .filter(Boolean);
    // Set of eligible student IDs for quick lookup (if needed)
    const eligibleStudentIds = new Set(
      eligibleStudents.map((s) => s.studentId?.toString()).filter(Boolean),
    );
    // ----------------------------
    // top company by ctc
    // ----------------------------
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
    // 1️⃣ Offers vs Date
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
    // 2️⃣ Global placement stats
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
      allStudents.reduce((sum, student) => sum + parseCTC(student.ctc), 0) /
        (totalPlacements || 1) || 0;
    const highestCTC = allStudents.reduce(
      (max, student) => Math.max(max, parseCTC(student.ctc)),
      0,
    );
    // Filter out invalid or zero CTCs first
    const validCTCs = allStudents
      .map((s) => parseCTC(s.ctc))
      .filter((ctc) => ctc > 0);
    const lowestCTC = validCTCs.length ? Math.min(...validCTCs) : 0;
    // 3. Overall CTC buckets
    const ctcBuckets = {
      "<5": 0,
      "5-12": 0,
      "12-20": 0,
      "20-30": 0,
      "30-40": 0,
      "40+": 0,
    };
    allStudents.forEach((student) => {
      const bucket = getCTCBucket(parseCTC(student.ctc));
      ctcBuckets[bucket] = (ctcBuckets[bucket] || 0) + 1;
    });
    // 4. Gender distribution (offers + unique students)
    const genderDist = {}; // total offers per gender
    const genderUnique = {}; // unique students per gender
    const genderStudentMap = {}; // gender -> Set of studentIds
    allStudents.forEach((s, idx) => {
      const g = s.gender || "Unknown";
      genderDist[g] = (genderDist[g] || 0) + 1;
      const id = s?.studentId
        ? s.studentId.toString()
        : `${s?.name || "unknown"}_${idx}`;
      if (!genderStudentMap[g]) genderStudentMap[g] = new Set();
      genderStudentMap[g].add(id);
    });
    // compute unique student counts
    Object.entries(genderStudentMap).forEach(([g, set]) => {
      genderUnique[g] = set.size;
    });
    // 5. Placements by course/department (existing logic)
    const placementsByCategory = {};
    if (!course || course === "ALL") {
      offers.forEach((offer) => {
        const courseKey = offer.course || "Unknown";
        const studentCount = offer.shortlisted_students.length;
        placementsByCategory[courseKey] =
          (placementsByCategory[courseKey] || 0) + studentCount;
      });
    } else {
      allStudents.forEach((student) => {
        const dept = student.department || "Unknown";
        placementsByCategory[dept] = (placementsByCategory[dept] || 0) + 1;
      });
    }
    // 6. Category, jobType, sector (existing)
    const categoryDist = {};
    const jobTypeDist = {};
    offers.forEach((offer) => {
      (offer.shortlisted_students || []).forEach((s) => {
        const cat = s.category || "Unknown";
        categoryDist[cat] = (categoryDist[cat] || 0) + 1;
        const jt = s.job_type || "Unknown";
        jobTypeDist[jt] = (jobTypeDist[jt] || 0) + 1;
      });
    });
    const sectorDist = {};
    offers.forEach((offer) => {
      const sector = offer.offer_sector || "Unknown";
      const studentCount = offer.shortlisted_students.length;
      sectorDist[sector] = (sectorDist[sector] || 0) + studentCount;
    });
    // 7. Companies with most offers (overall)
    const companyOffers = {};
    offers.forEach((offer) => {
      const company = offer.company_name || "Unknown";
      companyOffers[company] =
        (companyOffers[company] || 0) +
        (offer?.shortlisted_students?.length || 0);
    });
    const topCompanies = Object.entries(companyOffers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));
    // 🔹 Eligible (interested) & placement percentage
    const totalEligibleStudents = eligibleStudents.length || 0;
    const overallPlacementPercentage = parseFloat(
      ((uniquePlacements / totalEligibleStudents) * 100).toFixed(2),
    );
    // 3️⃣ Department-level stats
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
        // CTC
        const ctcVal = parseCTC(student.ctc);
        const bucket = getCTCBucket(ctcVal);
        D.ctcBuckets[bucket] = (D.ctcBuckets[bucket] || 0) + 1;
        if (ctcVal > 0) {
          D.ctcAcc.sum += ctcVal;
          D.ctcAcc.count += 1;
          if (ctcVal > D.maxCTC) D.maxCTC = ctcVal;
          if (ctcVal < D.minCTC) D.minCTC = ctcVal;
        }
        // Gender
        const g = student.gender || "Unknown";
        D.genderDist[g] = (D.genderDist[g] || 0) + 1;
        if (!D.genderUniqueMap[g]) D.genderUniqueMap[g] = new Set();
        D.genderUniqueMap[g].add(sid);
        // Job type
        const jt = student.job_type || "Unknown";
        D.jobTypeDist[jt] = (D.jobTypeDist[jt] || 0) + 1;
        // Category
        const cat = student.category || "Unknown";
        D.categoryDist[cat] = (D.categoryDist[cat] || 0) + 1;
        // Industry
        D.industryDist[sector] = (D.industryDist[sector] || 0) + 1;
        // Company
        D.companyOffers[company] = (D.companyOffers[company] || 0) + 1;
        // Company avg CTC
        if (!D.companyCTCAcc[company])
          D.companyCTCAcc[company] = { sum: 0, count: 0 };
        if (ctcVal > 0) {
          D.companyCTCAcc[company].sum += ctcVal;
          D.companyCTCAcc[company].count += 1;
        }
        // Offer by date
        if (dateKey) {
          D.offersByDate[dateKey] = (D.offersByDate[dateKey] || 0) + 1;
        }
      });
    });
    // Finalize per-department stats
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
        eligibleStudents: eligibleStudentsCount, // ✅ total eligible in department
        uniqueStudents,
        multipleOffers: multipleOfferCount,
        avgCTC: deptAvgCTC,
        highestCTC: data.maxCTC,
        lowestCTC: data.minCTC === Infinity ? 0 : data.minCTC,
        placementPercentage, // ✅ new field
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
      totalCompanies: totalCompanies,
      summerTotalCompanies: normalisedSummerCompanies.size,
      pendingCompanies: pendingCompanies.length,
      offCampusCompanies: offCampusCount,
      onCampusCompanies: onCampusCount,
      totalEligibleStudents, // ✅ overall eligible students
      overallPlacementPercentage, // ✅ overall placement percentage
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

export const getSummerInternInsights = async (req, res) => {
  try {
    const { course, batch } = req.query;

    let query = { visibility: true };
    if (course) query.course = course;
    if (batch) query.batch = batch;

    const summerOffers = await SummerIntern.find(query).sort({
      result_date: 1,
    });

    if (!summerOffers.length) {
      return res.status(404).json({ message: 'No offers found' })
    }

    // Flatten all students
    const allStudents = summerOffers.flatMap(
      (offer) => offer.shortlisted_students || [],
    );

    //  Unique + Double offers
    const studentMap = new Map();

    allStudents.forEach((s, idx) => {
      const id = s?.studentId
        ? s.studentId.toString()
        : `${s?.name || "unknown"}_${idx}`;

      studentMap.set(id, (studentMap.get(id) || 0) + 1);
    });

    const totalOffers = allStudents.length;
    const uniqueStudents = studentMap.size;
    const doubleOffers = [...studentMap.values()].filter((v) => v > 1).length;

    // Department-wise stats
    const deptMap = {};

    summerOffers.forEach((offer) => {
      (offer.shortlisted_students || []).forEach((student, idx) => {
        const dept = student.department || "Unknown";

        if (!deptMap[dept]) {
          deptMap[dept] = {
            totalOffers: 0,
            studentOfferCount: new Map(),
          };
        }

        const D = deptMap[dept];

        D.totalOffers += 1;

        const sid = student?.studentId
          ? student.studentId.toString()
          : `${student?.name || "unknown"}_${idx}_${dept}`;

        D.studentOfferCount.set(sid, (D.studentOfferCount.get(sid) || 0) + 1);
      });
    });

    // Final department stats
    const departmentStats = {};

    Object.entries(deptMap).forEach(([dept, data]) => {
      const unique = data.studentOfferCount.size;

      const multiple = [...data.studentOfferCount.values()].filter(
        (v) => v > 1,
      ).length;

      departmentStats[dept] = {
        totalOffers: data.totalOffers,
        uniqueStudents: unique,
        doubleOffers: multiple,
      };
    });

    // Final response
    const insights = {
      totalOffers,
      uniqueStudents,
      doubleOffers,
      departmentStats,
    };

    res.json(insights);
  } catch (error) {
    console.error("Error generating summer intern insights:", error);
    res.status(500).json({ message: error.message });
  }
};
