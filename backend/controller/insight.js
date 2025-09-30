import Offer from '../models/offer.js';
import Insight from '../models/insight-model/insight.js';


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
    console.log("course", course, "batch", batch);

    let query = { visibility: true };
    if (course) {query.course = course;}
    if (batch) {query.batch = batch;}

    const offers = await Offer.find(query)
      .sort({ result_date: 1 });

      console.log("offers", offers);
    if (!offers.length) {
      return res.status(404).json({ message: 'No offers found' });
    }
    const allStudents = offers.flatMap(offer => offer.shortlisted_students);

// 1. Total offers vs date
const offersByDate = {};
offers.forEach(offer => {
  const dateKey = offer.result_date.toISOString().split('T')[0]; // YYYY-MM-DD
  offersByDate[dateKey] =
    (offersByDate[dateKey] || 0) + (offer?.shortlisted_students?.length || 0);
});
let runningTotal = 0;
const offersVsDate = Object.entries(offersByDate)
  .sort((a, b) => new Date(a[0]) - new Date(b[0]))
  .map(([date, count]) => {
    runningTotal += count;
    return { date, count: runningTotal };
  });


  console.log("offersVsDate", offersVsDate);

    // 2. Number of placements and avg ctc and highest ctc and lowest ctc
    const map = new Map();
    allStudents.forEach(s => {
        const id = s.studentId.toString();
        map.set(id, (map.get(id) || 0) + 1);
    });
    const totalPlacements = allStudents.length;
    const uniquePlacements = map.size;
    const doublePlacements = [...map.values()].filter(v => v > 1).length;
    const avgCTC = allStudents.reduce((sum, student) => sum + parseCTC(student.ctc), 0) / totalPlacements || 0;
    const highestCTC = allStudents.reduce((max, student) => Math.max(max, parseCTC(student.ctc)), 0);
    const lowestCTC = allStudents.reduce((min, student) => Math.min(min, parseCTC(student.ctc)), Infinity);


    // 3. Pie chart for CTC buckets
    const ctcBuckets = { '<5': 0, '5-12': 0, '12-20': 0, '20-30': 0, '30-40': 0, '40+': 0 };
    allStudents.forEach(student => {
      const bucket = getCTCBucket(parseCTC(student.ctc));
      ctcBuckets[bucket]++;
    });


    // 4. Gender distribution
    const genderDist = {};
    allStudents.forEach(student => {
      const gender = student.gender || 'Unknown';
      genderDist[gender] = (genderDist[gender] || 0) + 1;
    });


    // 3. Placements by department/coursee
    const placementsByCategory = {};
    if (!course || course === 'ALL') {
      // Group by course when viewing all
      offers.forEach(offer => {
        const courseKey = offer.course || 'Unknown';
        const studentCount = offer.shortlisted_students.length;
        placementsByCategory[courseKey] = (placementsByCategory[courseKey] || 0) + studentCount;
      });
    } else {
      // Group by department when viewing specific course
      allStudents.forEach(student => {
        const dept = student.department || 'Unknown';
        placementsByCategory[dept] = (placementsByCategory[dept] || 0) + 1;
      });
    }

    // Remove empty buckets for cleaner visualization
    Object.keys(ctcBuckets).forEach(key => {
      if (ctcBuckets[key] === 0) {
        delete ctcBuckets[key];
      }
    });

    // 6. Category distribution
    const categoryDist = {};
    allStudents.forEach(student => {
      const cat = student.category || 'Unknown';
      categoryDist[cat] = (categoryDist[cat] || 0) + 1;
    });

    // 7. Job type distribution (Intern, Intern+FTE, etc.)
    const jobTypeDist = {};
    allStudents.forEach(student => {
      const type = student.job_type || 'Unknown';
      jobTypeDist[type] = (jobTypeDist[type] || 0) + 1;
    });


    // 9. Sector distribution (Private, PSU, etc.)
    const sectorDist = {};
    offers.forEach(offer => {
      const sector = offer.offer_sector || 'Unknown';
      const studentCount = offer.shortlisted_students.length;
      sectorDist[sector] = (sectorDist[sector] || 0) + studentCount;
    });


    // 11. Companies with most offers
const companyOffers = {};
offers.forEach(offer => {
  const company = offer.company_name || 'Unknown';
  companyOffers[company] =
    (companyOffers[company] || 0) + (offer?.shortlisted_students?.length || 0);
});

const topCompanies = Object.entries(companyOffers)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5)
  .map(([company, count]) => ({ company, count }));



    const insights = {
      offersVsDate,
      totalPlacements,
      doublePlacements,
      uniquePlacements,
      avgCTC: parseFloat(avgCTC.toFixed(2)),
      highestCTC: parseFloat(highestCTC.toFixed(2)),
      lowestCTC: parseFloat(lowestCTC.toFixed(2)),
      placementsByDepartment: placementsByCategory, // Renamed to be more generic
      ctcBuckets, // For pie chart
      genderDist, // For pie or bar
      categoryDist, // For pie
      jobTypeDist, // For pie
      sectorDist, // For pie
      topCompanies, // For bar or list
      totalOffers: offers.length,
      totalCompanies: new Set(offers.map(offer => offer.company_name)).size,
      filterApplied: course && course !== 'ALL' ? course : 'All Courses'
    };

    console.log("Insights generated for:", insights.filterApplied);
    res.json(insights);
  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({ message: error.message });
  }
};



// Create or update Insight for a course and batch
export const setInsight = async (req, res) => {
  try {
    const { course, batch, type, goals } = req.body;
    if (!course || !batch) {
      return res.status(400).json({ message: 'Course and batch are required' });
    }

    // Find existing or create new
    let insight = await Insight.findOne({ course, batch });
    if (insight) {
      if (type) insight.type = type;
      if (goals) insight.goal = goals; // Note: schema has goal as array
      await insight.save();
      return res.json(insight);
    }

    insight = new Insight({ course, batch, type, goal: goals });
    await insight.save();
    res.status(201).json(insight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Insight for a specific course and batch
export const getInsight = async (req, res) => {
  try {
    const { course, batch } = req.query;
    if (!course || !batch) {
      return res.status(400).json({ message: 'Course and batch are required' });
    }

    const insight = await Insight.findOne({ course, batch });
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }

    res.json(insight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};