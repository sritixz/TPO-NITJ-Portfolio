// import Insight from '../models/insight-model/insight.js';
// import Offer from '../models/offer.js';


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
//     console.log("course", course, "batch", batch);

//     let query = { visibility: true };
//     if (course) {query.course = course;}
//     if (batch) {query.batch = batch;}

//     const offers = await Offer.find(query)
//       .sort({ result_date: 1 });

//       console.log("offers", offers);
//     if (!offers.length) {
//       return res.status(404).json({ message: 'No offers found' });
//     }
//     const allStudents = offers.flatMap(offer => offer.shortlisted_students);

// // 1. Total offers vs date
// const offersByDate = {};
// offers.forEach(offer => {
//   const dateKey = offer.result_date.toISOString().split('T')[0]; // YYYY-MM-DD
//   offersByDate[dateKey] =
//     (offersByDate[dateKey] || 0) + (offer?.shortlisted_students?.length || 0);
// });
// let runningTotal = 0;
// const offersVsDate = Object.entries(offersByDate)
//   .sort((a, b) => new Date(a[0]) - new Date(b[0]))
//   .map(([date, count]) => {
//     runningTotal += count;
//     return { date, count: runningTotal };
//   });


//   console.log("offersVsDate", offersVsDate);

//     // 2. Number of placements and avg ctc and highest ctc and lowest ctc
//     const map = new Map();
//     allStudents.forEach(s => {
//         const id = s.studentId.toString();
//         map.set(id, (map.get(id) || 0) + 1);
//     });
//     const totalPlacements = allStudents.length;
//     const uniquePlacements = map.size;
//     const doublePlacements = [...map.values()].filter(v => v > 1).length;
//     const avgCTC = allStudents.reduce((sum, student) => sum + parseCTC(student.ctc), 0) / totalPlacements || 0;
//     const highestCTC = allStudents.reduce((max, student) => Math.max(max, parseCTC(student.ctc)), 0);
//     const lowestCTC = allStudents.reduce((min, student) => Math.min(min, parseCTC(student.ctc)), Infinity);


//     // 3. Pie chart for CTC buckets
//     const ctcBuckets = { '<5': 0, '5-12': 0, '12-20': 0, '20-30': 0, '30-40': 0, '40+': 0 };
//     allStudents.forEach(student => {
//       const bucket = getCTCBucket(parseCTC(student.ctc));
//       ctcBuckets[bucket]++;
//     });


//     // 4. Gender distribution
//     const genderDist = {};
//     allStudents.forEach(student => {
//       const gender = student.gender || 'Unknown';
//       genderDist[gender] = (genderDist[gender] || 0) + 1;
//     });


//     // 3. Placements by department/coursee
//     const placementsByCategory = {};
//     if (!course || course === 'ALL') {
//       // Group by course when viewing all
//       offers.forEach(offer => {
//         const courseKey = offer.course || 'Unknown';
//         const studentCount = offer.shortlisted_students.length;
//         placementsByCategory[courseKey] = (placementsByCategory[courseKey] || 0) + studentCount;
//       });
//     } else {
//       // Group by department when viewing specific course
//       allStudents.forEach(student => {
//         const dept = student.department || 'Unknown';
//         placementsByCategory[dept] = (placementsByCategory[dept] || 0) + 1;
//       });
//     }

//     // Remove empty buckets for cleaner visualization
//     Object.keys(ctcBuckets).forEach(key => {
//       if (ctcBuckets[key] === 0) {
//         delete ctcBuckets[key];
//       }
//     });

//     // 6. Category distribution
//     const categoryDist = {};
//     allStudents.forEach(student => {
//       const cat = student.category || 'Unknown';
//       categoryDist[cat] = (categoryDist[cat] || 0) + 1;
//     });

//     // 7. Job type distribution (Intern, Intern+FTE, etc.)
//     const jobTypeDist = {};
//     allStudents.forEach(student => {
//       const type = student.job_type || 'Unknown';
//       jobTypeDist[type] = (jobTypeDist[type] || 0) + 1;
//     });


//     // 9. Sector distribution (Private, PSU, etc.)
//     const sectorDist = {};
//     offers.forEach(offer => {
//       const sector = offer.offer_sector || 'Unknown';
//       const studentCount = offer.shortlisted_students.length;
//       sectorDist[sector] = (sectorDist[sector] || 0) + studentCount;
//     });


//     // 11. Companies with most offers
// const companyOffers = {};
// offers.forEach(offer => {
//   const company = offer.company_name || 'Unknown';
//   companyOffers[company] =
//     (companyOffers[company] || 0) + (offer?.shortlisted_students?.length || 0);
// });

// const topCompanies = Object.entries(companyOffers)
//   .sort(([, a], [, b]) => b - a)
//   .slice(0, 5)
//   .map(([company, count]) => ({ company, count }));



//     const insights = {
//       offersVsDate,
//       totalPlacements,
//       doublePlacements,
//       uniquePlacements,
//       avgCTC: parseFloat(avgCTC.toFixed(2)),
//       highestCTC: parseFloat(highestCTC.toFixed(2)),
//       lowestCTC: parseFloat(lowestCTC.toFixed(2)),
//       placementsByDepartment: placementsByCategory, // Renamed to be more generic
//       ctcBuckets, // For pie chart
//       genderDist, // For pie or bar
//       categoryDist, // For pie
//       jobTypeDist, // For pie
//       sectorDist, // For pie
//       topCompanies, // For bar or list
//       totalOffers: offers.length,
//       totalCompanies: new Set(offers.map(offer => offer.company_name)).size,
//       filterApplied: course && course !== 'ALL' ? course : 'All Courses'
//     };

//     console.log("Insights generated for:", insights.filterApplied);
//     res.json(insights);
//   } catch (error) {
//     console.error("Error generating insights:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

import Offer from '../models/offer.js';

const parseCTC = (ctc) => {
  if (!ctc) return 0;
  const numeric = parseFloat(ctc.replace(/[^0-9.]/g, ''));
  return isNaN(numeric) ? 0 : numeric;
};

const getCTCBucket = (ctc) => {
  if (ctc < 5) return '<5';
  if (ctc >= 5 && ctc < 12) return '5-12';
  if (ctc >= 12 && ctc < 20) return '12-20';
  if (ctc >= 20 && ctc < 30) return '20-30';
  if (ctc >= 30 && ctc < 40) return '30-40';
  return '40+';
};

export const getOfferInsights = async (req, res) => {
  try {
    const { course, batch } = req.query;
    let query = { visibility: true };
    if (course) query.course = course;
    if (batch) query.batch = batch;

    const offers = await Offer.find(query).sort({ result_date: 1 });

    if (!offers.length) {
      return res.status(404).json({ message: 'No offers found' });
    }

    const allStudents = offers.flatMap(offer => offer.shortlisted_students || []);

    //topcompanybyctc
    const topCompaniesByCTC = await Offer.aggregate([
  { $match: { course: course, batch: batch } },
  {
    $group: {
      _id: "$company_name",
      max_ctc: { $max: "$ctc" },
      avg_ctc: { $avg: "$ctc" },
      totalOffers: { $sum: 1 }
    }
  },
  { $sort: { max_ctc: -1 } },
  { $limit: 5 }
]);


    // 1. Total offers vs date
    const offersByDate = {};
    offers.forEach(offer => {
      if (!offer.result_date) return;
      const dateKey = offer.result_date.toISOString().split('T')[0]; // YYYY-MM-DD
      offersByDate[dateKey] = (offersByDate[dateKey] || 0) + (offer?.shortlisted_students?.length || 0);
    });
    let runningTotal = 0;
    const offersVsDate = Object.entries(offersByDate)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => {
        runningTotal += count;
        return { date, count: runningTotal };
      });

    // 2. Overall placements and CTC stats
    const map = new Map();
    allStudents.forEach((s, idx) => {
      const id = s?.studentId ? s.studentId.toString() : `${s?.name || 'unknown'}_${idx}`;
      map.set(id, (map.get(id) || 0) + 1);
    });
    const totalPlacements = allStudents.length;
    const uniquePlacements = map.size;
    const doublePlacements = [...map.values()].filter(v => v > 1).length;
    const avgCTC = allStudents.reduce((sum, student) => sum + parseCTC(student.ctc), 0) / (totalPlacements || 1) || 0;
    const highestCTC = allStudents.reduce((max, student) => Math.max(max, parseCTC(student.ctc)), 0);
    const lowestCTC = allStudents.reduce((min, student) => Math.min(min, parseCTC(student.ctc)), Infinity);

    // 3. Overall CTC buckets
    const ctcBuckets = { '<5': 0, '5-12': 0, '12-20': 0, '20-30': 0, '30-40': 0, '40+': 0 };
    allStudents.forEach(student => {
      const bucket = getCTCBucket(parseCTC(student.ctc));
      ctcBuckets[bucket] = (ctcBuckets[bucket] || 0) + 1;
    });

    // 4. Gender distribution
    // const genderDist = {};
    // allStudents.forEach(student => {
    //   const gender = student.gender || 'Unknown';
    //   genderDist[gender] = (genderDist[gender] || 0) + 1;
    // });

    // 4. Gender distribution (offers + unique students)
const genderDist = {}; // total offers per gender
const genderUnique = {}; // unique students per gender
const genderStudentMap = {}; // gender -> Set of studentIds

allStudents.forEach((s, idx) => {
  const g = s.gender || 'Unknown';
  genderDist[g] = (genderDist[g] || 0) + 1;

  const id = s?.studentId ? s.studentId.toString() : `${s?.name || 'unknown'}_${idx}`;
  if (!genderStudentMap[g]) genderStudentMap[g] = new Set();
  genderStudentMap[g].add(id);
});

// compute unique student counts
Object.entries(genderStudentMap).forEach(([g, set]) => {
  genderUnique[g] = set.size;
});


    // 5. Placements by course/department (existing logic)
    const placementsByCategory = {};
    if (!course || course === 'ALL') {
      offers.forEach(offer => {
        const courseKey = offer.course || 'Unknown';
        const studentCount = offer.shortlisted_students.length;
        placementsByCategory[courseKey] = (placementsByCategory[courseKey] || 0) + studentCount;
      });
    } else {
      allStudents.forEach(student => {
        const dept = student.department || 'Unknown';
        placementsByCategory[dept] = (placementsByCategory[dept] || 0) + 1;
      });
    }

    // 6. Category, jobType, sector (existing)
    const categoryDist = {};
    const jobTypeDist = {};
    offers.forEach(offer => {
      (offer.shortlisted_students || []).forEach(s => {
        const cat = s.category || 'Unknown';
        categoryDist[cat] = (categoryDist[cat] || 0) + 1;
        const jt = s.job_type || 'Unknown';
        jobTypeDist[jt] = (jobTypeDist[jt] || 0) + 1;
      });
    });

    const sectorDist = {};
    offers.forEach(offer => {
      const sector = offer.offer_sector || 'Unknown';
      const studentCount = offer.shortlisted_students.length;
      sectorDist[sector] = (sectorDist[sector] || 0) + studentCount;
    });

    // 7. Companies with most offers (overall)
    const companyOffers = {};
    offers.forEach(offer => {
      const company = offer.company_name || 'Unknown';
      companyOffers[company] = (companyOffers[company] || 0) + (offer?.shortlisted_students?.length || 0);
    });
    const topCompanies = Object.entries(companyOffers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));

// ----------------------------
// New: Per-department statistics (updated to include CTC, gender, offer vs date)
// ----------------------------
const deptMap = {}; // key -> aggregated data containers

offers.forEach(offer => {
  const sector = offer.offer_sector || 'Unknown';
  const company = offer.company_name || 'Unknown';
  const dateKey = offer.result_date ? offer.result_date.toISOString().split('T')[0] : null;

  (offer.shortlisted_students || []).forEach((student, idx) => {
    const dept = student.department || 'Unknown';
    if (!deptMap[dept]) {
      deptMap[dept] = {
        totalOffers: 0,
        studentOfferCount: new Map(),
        ctcBuckets: { '<5': 0, '5-12': 0, '12-20': 0, '20-30': 0, '30-40': 0, '40+': 0 },
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
        offersByDate: {} // <-- department-level date-wise offers
      };
    }

    const D = deptMap[dept];
    D.totalOffers += 1;

    const sid = student?.studentId ? student.studentId.toString() : `${student?.name || 'unknown'}_${idx}_${dept}`;
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
    // const g = student.gender || 'Unknown';
    // D.genderDist[g] = (D.genderDist[g] || 0) + 1;
    const g = student.gender || 'Unknown';
D.genderDist[g] = (D.genderDist[g] || 0) + 1;

if (!D.genderUniqueMap[g]) D.genderUniqueMap[g] = new Set();
const sidForGender = student?.studentId ? student.studentId.toString() : `${student?.name || 'unknown'}_${idx}_${dept}`;
D.genderUniqueMap[g].add(sidForGender);


    // Job type
    const jt = student.job_type || 'Unknown';
    D.jobTypeDist[jt] = (D.jobTypeDist[jt] || 0) + 1;

    // Category
    const cat = student.category || 'Unknown';
    D.categoryDist[cat] = (D.categoryDist[cat] || 0) + 1;

    // Industry
    D.industryDist[sector] = (D.industryDist[sector] || 0) + 1;

    // Company offer count
    D.companyOffers[company] = (D.companyOffers[company] || 0) + 1;

    // Company CTC avg
    if (!D.companyCTCAcc[company]) D.companyCTCAcc[company] = { sum: 0, count: 0 };
    if (ctcVal > 0) {
      D.companyCTCAcc[company].sum += ctcVal;
      D.companyCTCAcc[company].count += 1;
    }

    // Offer vs date for department
    if (dateKey) {
      D.offersByDate[dateKey] = (D.offersByDate[dateKey] || 0) + 1;
    }
  });
});

// Finalize department stats
const departmentStats = {};
Object.entries(deptMap).forEach(([dept, data]) => {
  const uniqueStudents = data.studentOfferCount.size;
  const multipleOfferCount = [...data.studentOfferCount.values()].filter(v => v > 1).length;

  // Clean ctc buckets
  const cleanedCtcBuckets = {};
  Object.entries(data.ctcBuckets).forEach(([k, v]) => { if (v > 0) cleanedCtcBuckets[k] = v; });

  // Offer vs date cumulative
  let running = 0;
  const offersVsDate = Object.entries(data.offersByDate)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, count]) => {
      running += count;
      return { date, count: running };
    });

  // Top 5 companies by offers
  const topByCount = Object.entries(data.companyOffers)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([company, count]) => ({ company, count }));

  // Top 5 companies by avg ctc
  const companyAvgCTCs = Object.entries(data.companyCTCAcc)
    .map(([company, acc]) => ({ company, avgCTC: acc.count ? acc.sum / acc.count : 0 }))
    .filter(c => c.avgCTC > 0)
    .sort((a, b) => b.avgCTC - a.avgCTC)
    .slice(0, 5)
    .map(c => ({ company: c.company, avgCTC: parseFloat(c.avgCTC.toFixed(2)) }));

  // Department-level CTC summary
  const deptAvgCTC = data.ctcAcc.count ? parseFloat((data.ctcAcc.sum / data.ctcAcc.count).toFixed(2)) : 0;
  const deptHighestCTC = data.maxCTC ? parseFloat(data.maxCTC.toFixed(2)) : 0;
  const deptLowestCTC = isFinite(data.minCTC) && data.minCTC !== Infinity ? parseFloat(data.minCTC.toFixed(2)) : 0;

  // compute gender unique counts
const genderUnique = {};
Object.entries(data.genderUniqueMap).forEach(([g, set]) => {
  genderUnique[g] = set.size;
});


  departmentStats[dept] = {
    totalOffers: data.totalOffers,
    multipleOffers: multipleOfferCount,
    uniqueStudents,
    avgCTC: deptAvgCTC,
    highestCTC: deptHighestCTC,
    lowestCTC: deptLowestCTC,
    genderDist: data.genderDist,
    genderUnique,
    ctcBuckets: cleanedCtcBuckets,
    jobTypeDist: data.jobTypeDist,
    categoryDist: data.categoryDist,
    industryDist: data.industryDist,
    topCompaniesByCount: topByCount,
    topCompaniesByAvgCTC: companyAvgCTCs,
    offersVsDate // <-- department offer trend
  };
});



    // Remove empty global ctc buckets for cleaner visualization
    Object.keys(ctcBuckets).forEach(key => {
      if (ctcBuckets[key] === 0) delete ctcBuckets[key];
    });

    console.log(departmentStats);

    const insights = {
      offersVsDate,
      totalPlacements,
      doublePlacements,
      uniquePlacements,
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
      totalCompanies: new Set(offers.map(offer => offer.company_name)).size,
      filterApplied: course && course !== 'ALL' ? course : 'All Courses',
      departmentStats // <-- new detailed per-department data
    };



insights.topCompaniesByCTC = topCompaniesByCTC.map(c => ({
  company: c._id,
  maxCTC: c.max_ctc,
  avgCTC: c.avg_ctc,
  totalOffers: c.totalOffers
}));

    res.json(insights);
  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({ message: error.message });
  }
};


// // Create or update Insight for a course and batch
// export const setInsight = async (req, res) => {
//   try {
//     const { course, batch, type, goals } = req.body;
//     if (!course || !batch) {
//       return res.status(400).json({ message: 'Course and batch are required' });
//     }

//     // Find existing or create new
//     let insight = await Insight.findOne({ course, batch });
//     if (insight) {
//       if (type) insight.type = type;
//       if (goals) insight.goal = goals; // Note: schema has goal as array
//       await insight.save();
//       return res.json(insight);
//     }

//     insight = new Insight({ course, batch, type, goal: goals });
//     await insight.save();
//     res.status(201).json(insight);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get Insight for a specific course and batch
// export const getInsight = async (req, res) => {
//   try {
//     const { course, batch } = req.query;
//     if (!course || !batch) {
//       return res.status(400).json({ message: 'Course and batch are required' });
//     }

//     const insight = await Insight.findOne({ course, batch });
//     if (!insight) {
//       return res.status(404).json({ message: 'Insight not found' });
//     }

//     res.json(insight);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };