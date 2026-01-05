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

// import Offer from '../models/offer.js';
// import PlacementRegistration from '../models/placement-registration.js';
// import Student from '../models/user_model/student.js';
// import axios from 'axios';
// import { encryptValue, decryptValue } from "../utils/security.js";

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

// // Helper function to chunk an array into smaller batches
// const chunkArray = (array, chunkSize) => {
//   const chunks = [];
//   for (let i = 0; i < array.length; i += chunkSize) {
//     chunks.push(array.slice(i, i + chunkSize));
//   }
//   return chunks;
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
//     // Fetch corresponding Student documents to get rollno and department
//     const studentIds = interestedStudents.map(s => s.studentId).filter(Boolean);
//     let students = [];
//     let erpDataMap = new Map();
//     if (studentIds.length > 0) {
//       students = await Student.find({ _id: { $in: studentIds } });
//       const rollNumbers = students.map(s => s.rollno).filter(Boolean);
//       if (rollNumbers.length > 0) {
//         // Batch ERP requests to parallelize and reduce per-request load
//         const batchSize = 10; // Adjust based on ERP server limits/performance
//         const rollNumberChunks = chunkArray(rollNumbers, batchSize);
//         const erpPromises = rollNumberChunks.map(chunk => {
//           const payload = { rollNumbers: chunk, portalKey: process.env.ERP_IDENTITY_SECRET };
//           const encryptedData = encryptValue(JSON.stringify(payload));
//           return axios.post(`${process.env.ERP_SERVER}`, encryptedData)
//             .then(response => {
//               const erpChunk = JSON.parse(decryptValue(response.data.data)) || [];
//               return erpChunk;
//             })
//             .catch(error => {
//               console.error(`Error fetching ERP data for batch starting with ${chunk[0]}:`, error.message);
//               return []; // Return empty array to continue with other batches
//             });
//         });

//         // Execute all batches in parallel
//         try {
//           const allErpResults = await Promise.all(erpPromises);
//           const allErpStudents = allErpResults.flat();
//           allErpStudents.forEach(erpStudent => {
//             erpDataMap.set(erpStudent.rollno, {
//               cgpa: parseFloat(erpStudent.cgpa || 0),
//               active_backlogs: erpStudent.active_backlogs === 'true'
//             });
//           });
//         } catch (error) {
//           console.error("Error in parallel ERP batch processing:", error.message);
//           // Continue without ERP data, relying on database
//         }
//       }
//     }
//     // Filter to eligible students (CGPA >= 6 and no active backlogs)
//     const eligibleStudents = interestedStudents
//       .map(pr => {
//         const student = students.find(s => s._id.toString() === pr.studentId.toString());
//         if (!student) return null;
//         const erpData = erpDataMap.get(student.rollno);
//         const cgpa = parseFloat(erpData?.cgpa ?? student.cgpa ?? 0);
//         const active_backlogs = erpData?.active_backlogs ?? student.active_backlogs ?? false;
//         if (cgpa >= 6 && !active_backlogs) {
//           return { ...pr.toObject(), student, erpData, cgpa, active_backlogs };
//         }
//         return null;
//       })
//       .filter(Boolean);
//     // Set of eligible student IDs for quick lookup (if needed)
//     const eligibleStudentIds = new Set(
//       eligibleStudents.map(s => s.studentId?.toString()).filter(Boolean)
//     );
//     // ----------------------------
//     // top company by ctc
//     // ----------------------------
//     let matchStage = { visibility: true };
//     if (course) matchStage.course = course;
//     if (batch) matchStage.batch = batch;
//     const topCompaniesByCTC = await Offer.aggregate([
//       { $match: matchStage },
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
//     // 3. Overall CTC buckets
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
//     const totalEligibleStudents = eligibleStudents.length||0;
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
//       const eligibleStudentsCount = eligibleStudents.filter(es => es.student.department === dept).length || 1;
//       const placementPercentage = parseFloat(((uniqueStudents / eligibleStudentsCount) * 100).toFixed(2));
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
//         eligibleStudents: eligibleStudentsCount, // ✅ total eligible in department
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

import Offer from '../models/offer.js';
import PlacementRegistration from '../models/placement-registration.js';
import Student from '../models/user_model/student.js';
import axios from 'axios';
import { encryptValue, decryptValue } from "../utils/security.js";

/* ===================== HELPERS ===================== */

const normalize = (v) => v?.toLowerCase().replace(/\./g, "");

const parseCTC = (ctc) => {
  if (!ctc) return 0;
  const numeric = parseFloat(ctc.replace(/[^0-9.]/g, ''));
  return isNaN(numeric) ? 0 : numeric;
};

const getCTCBucket = (ctc) => {
  if (ctc < 5) return '<5';
  if (ctc < 12) return '5-12';
  if (ctc < 20) return '12-20';
  if (ctc < 30) return '20-30';
  if (ctc < 40) return '30-40';
  return '40+';
};

const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/* ===================== CONTROLLER ===================== */

export const getOfferInsights = async (req, res) => {
  try {
    const { course, batch } = req.query;

    /* ===================== FETCH OFFERS ===================== */
    const query = { visibility: true };
    if (batch) query.batch = batch;

    const offers = await Offer.find(query).populate({
      path: "shortlisted_students.studentId",
      select: "course rollno cgpa active_backlogs erpLastUpdated"
    }).sort({ result_date: 1 });

    if (!offers.length) {
      return res.status(404).json({ message: "No offers found" });
    }

    /* ===================== FILTER STUDENTS (OPTION 2 CORE) ===================== */
    const allStudents = offers.flatMap(offer =>
      (offer.shortlisted_students || []).filter(s =>
        !course || normalize(s.studentId?.course) === normalize(course)
      )
    );

    /* ===================== INTERESTED & ELIGIBLE STUDENTS ===================== */
    const interestedQuery = { interested: true };
    if (batch) interestedQuery.batch = batch;

    const interestedRegs = await PlacementRegistration.find(interestedQuery);
    const studentIds = interestedRegs.map(r => r.studentId).filter(Boolean);

    let students = [];
    if (studentIds.length) {
      students = await Student.find({ _id: { $in: studentIds } });
    }

    /* ===================== ERP SYNC (UNCHANGED LOGIC) ===================== */
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const staleStudents = students.filter(
      s => !s.erpLastUpdated || s.erpLastUpdated < thirtyDaysAgo
    );

    if (staleStudents.length) {
      const rollChunks = chunkArray(
        staleStudents.map(s => s.rollno),
        100
      );

      const erpResponses = await Promise.all(
        rollChunks.map(chunk => {
          const payload = encryptValue(JSON.stringify({
            rollNumbers: chunk,
            portalKey: process.env.ERP_IDENTITY_SECRET
          }));
          return axios.post(process.env.ERP_SERVER, payload)
            .then(r => JSON.parse(decryptValue(r.data.data)) || [])
            .catch(() => []);
        })
      );

      const updates = [];
      erpResponses.flat().forEach(e => {
        const s = students.find(x => x.rollno === e.rollno);
        if (s) {
          s.cgpa = parseFloat(e.cgpa || 0);
          s.active_backlogs = e.active_backlogs === "true";
          s.erpLastUpdated = new Date();
          updates.push({
            updateOne: {
              filter: { _id: s._id },
              update: {
                $set: {
                  cgpa: s.cgpa,
                  active_backlogs: s.active_backlogs,
                  erpLastUpdated: s.erpLastUpdated
                }
              }
            }
          });
        }
      });

      if (updates.length) await Student.bulkWrite(updates);
    }

    /* ===================== ELIGIBLE STUDENTS ===================== */
    const eligibleStudents = interestedRegs
      .map(reg => {
        const student = students.find(s => s._id.toString() === reg.studentId?.toString());
        if (!student) return null;
        if (course && normalize(student.course) !== normalize(course)) return null;
        if (student.cgpa >= 6 && !student.active_backlogs) {
          return student;
        }
        return null;
      })
      .filter(Boolean);

    const totalEligibleStudents = eligibleStudents.length || 0;

    /* ===================== GLOBAL STATS ===================== */
    const studentMap = new Map();
    allStudents.forEach((s, i) => {
      const id = s.studentId?._id?.toString() || `${s.name}_${i}`;
      studentMap.set(id, (studentMap.get(id) || 0) + 1);
    });

    const totalPlacements = allStudents.length;
    const uniquePlacements = studentMap.size;
    const doublePlacements = [...studentMap.values()].filter(v => v > 1).length;

    const ctcValues = allStudents.map(s => parseCTC(s.ctc)).filter(v => v > 0);
    const avgCTC = ctcValues.length ? ctcValues.reduce((a,b)=>a+b,0)/ctcValues.length : 0;
    const highestCTC = ctcValues.length ? Math.max(...ctcValues) : 0;
    const lowestCTC = ctcValues.length ? Math.min(...ctcValues) : 0;

    /* ===================== CTC BUCKETS ===================== */
    const ctcBuckets = { '<5':0,'5-12':0,'12-20':0,'20-30':0,'30-40':0,'40+':0 };
    allStudents.forEach(s => {
      ctcBuckets[getCTCBucket(parseCTC(s.ctc))]++;
    });

    /* ===================== GENDER ===================== */
    const genderDist = {};
    const genderUnique = {};
    const gmap = {};
    allStudents.forEach((s,i) => {
      const g = s.gender || "Unknown";
      genderDist[g] = (genderDist[g] || 0) + 1;
      const id = s.studentId?._id?.toString() || `${s.name}_${i}`;
      if (!gmap[g]) gmap[g] = new Set();
      gmap[g].add(id);
    });
    Object.entries(gmap).forEach(([g,set]) => genderUnique[g] = set.size);

    /* ===================== PLACEMENTS BY DEPT / COURSE ===================== */
    const placementsByDepartment = {};
    allStudents.forEach(s => {
      const key = course ? (s.department || "Unknown") : (s.studentId?.course || "Unknown");
      placementsByDepartment[key] = (placementsByDepartment[key] || 0) + 1;
    });

    /* ===================== DEPARTMENT LEVEL STATS ===================== */
    const deptStats = {};
    offers.forEach(offer => {
      (offer.shortlisted_students || []).forEach((s,i) => {
        if (course && normalize(s.studentId?.course) !== normalize(course)) return;
        const dept = s.department || "Unknown";
        if (!deptStats[dept]) {
          deptStats[dept] = {
            totalOffers:0,
            students:new Map(),
            ctc:{sum:0,count:0,min:Infinity,max:0}
          };
        }
        const D = deptStats[dept];
        D.totalOffers++;
        const id = s.studentId?._id?.toString() || `${s.name}_${i}`;
        D.students.set(id,(D.students.get(id)||0)+1);
        const c = parseCTC(s.ctc);
        if (c>0){
          D.ctc.sum+=c; D.ctc.count++;
          D.ctc.min=Math.min(D.ctc.min,c);
          D.ctc.max=Math.max(D.ctc.max,c);
        }
      });
    });

    const departmentStats = {};
    Object.entries(deptStats).forEach(([dept,d])=>{
      const uniqueStudents = d.students.size;
      const eligibleCount = eligibleStudents.filter(s=>s.department===dept).length || 1;
      departmentStats[dept] = {
        totalOffers: d.totalOffers,
        uniqueStudents,
        avgCTC: d.ctc.count ? +(d.ctc.sum/d.ctc.count).toFixed(2):0,
        highestCTC: d.ctc.max,
        lowestCTC: d.ctc.min===Infinity?0:d.ctc.min,
        placementPercentage: +((uniqueStudents/eligibleCount)*100).toFixed(2)
      };
    });

    /* ===================== FINAL RESPONSE ===================== */
    res.json({
      totalPlacements,
      uniquePlacements,
      doublePlacements,
      avgCTC:+avgCTC.toFixed(2),
      highestCTC,
      lowestCTC,
      ctcBuckets,
      genderDist,
      genderUnique,
      placementsByDepartment,
      totalEligibleStudents,
      overallPlacementPercentage: +((uniquePlacements/totalEligibleStudents)*100 || 0).toFixed(2),
      filterApplied: course || "All Courses",
      departmentStats
    });

  } catch (err) {
    console.error("Error generating insights:", err);
    res.status(500).json({ message: err.message });
  }
};

