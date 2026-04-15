import Internship from '../models/internship.js';
import SummerIntern from '../models/summer_internship.js';
import Student from '../models/user_model/student.js';


export const getAllInternships = async (req, res) => {
  try {
    const allInternships = await Internship.find().sort({ createdAt: -1 });
    res.json(allInternships);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInternshipsInsights = async (req, res) => {
  try {
    const {
      company_name,
      student_name,
      batch,
      degree,
      gender,
      department,
      stipend,
      internship_duration,
      internship_offer_mode,
    } = req.query;

    const filters = {};
    if (company_name) filters.company_name = { $regex: company_name, $options: "i" };
    if (batch) filters.batch = batch;
    if (degree) filters.degree = degree;
    if (stipend) filters.stipend = stipend;
    if (internship_duration) filters.internship_duration = internship_duration;
    if (internship_offer_mode) filters.internship_offer_mode = internship_offer_mode;

    let internships = await Internship.find(filters);

    let totalStudentsSelected = 0;
    let totalStipend = 0;
    let countStipend = 0;
    const companiesVisited = new Set();
    const uniqueStudentKeys = new Set();

    for (const internship of internships) {
      const matchingStudents = internship.shortlisted_students.filter((student) => {
        const matchesGender = !gender || student.gender?.toLowerCase() === gender.toLowerCase();
        const matchesDepartment = !department || student.department?.toLowerCase() === department.toLowerCase();
        const matchesStudentName = !student_name || student.name?.toLowerCase().includes(student_name.toLowerCase());
        return matchesGender && matchesDepartment && matchesStudentName;
      });

      if (matchingStudents.length === 0) continue;

      totalStudentsSelected += matchingStudents.length;
      companiesVisited.add(internship.company_name);

      for (const student of matchingStudents) {
        const key = student.studentId?.toString() || `${student.name?.toLowerCase()}|${student.email?.toLowerCase()}`;
        uniqueStudentKeys.add(key);
      }

      const numericStipend = parseFloat(internship.stipend);
      if (!isNaN(numericStipend)) {
        totalStipend += numericStipend * matchingStudents.length;
        countStipend += matchingStudents.length;
      }
    }

    const averageStipend = countStipend > 0 ? (totalStipend / countStipend).toFixed(2) : "N/A";

    res.status(200).json({
      totalStudentsSelected: uniqueStudentKeys.size,
      companiesVisited: companiesVisited.size,
      average_stipend: averageStipend,
    });
  } catch (error) {
    console.error("Error in getInternshipInsights:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFilteredInternships = async (req, res) => {
  try {
    const {
      company_name,
      student_name,
      batch,
      degree,
      gender,
      department,
      stipend,
      internship_duration,
      internship_offer_mode,
    } = req.query;

    const filters = {};
    if (company_name) filters.company_name = { $regex: company_name, $options: "i" };
    if (batch) filters.batch = batch;
    if (degree) filters.degree = degree;
    if (stipend) filters.stipend = stipend;
    if (internship_duration) filters.internship_duration = internship_duration;
    if (internship_offer_mode) filters.internship_offer_mode = internship_offer_mode;

    const allInternships = await Internship.find(filters);

    const filteredInternships = allInternships.map((internship) => {
      const filteredStudents = internship.shortlisted_students.filter((student) => {
        const matchesGender = !gender || student.gender?.toLowerCase() === gender.toLowerCase();
        const matchesDepartment = !department || student.department?.toLowerCase() === department.toLowerCase();
        const matchesStudentName =
          !student_name || student.name?.toLowerCase().includes(student_name.toLowerCase());
        return matchesGender && matchesDepartment && matchesStudentName;
      });

      return { ...internship.toObject(), shortlisted_students: filteredStudents };
    });

    const finalInternships = filteredInternships.filter(
      (internship) => internship.shortlisted_students.length > 0
    );

    res.status(200).json(finalInternships);
  } catch (error) {
    console.error("Error fetching internships:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// backend/controller/internship.js

export const getSummerInternshipAnalytics = async (req, res) => {
  try {
    const { course, batch } = req.query;
    const filter = { visibility: true };
    if (course && course !== "All") filter.course = course;
    if (batch) filter.batch = batch;

    const summerOffers = await SummerIntern.find(filter);
    if (!summerOffers.length) return res.status(200).json({ totalOffers: 0, noData: true });

    // Flatten all students into one array
    const allStudents = summerOffers.flatMap(offer => offer.shortlisted_students || []);
    
    // 1. UNIQUE STUDENTS SELECTION LOGIC
    const uniqueStudentIds = new Set();
    allStudents.forEach(s => {
      // Fallback to name-email combo if studentId is missing
      const id = s.studentId?.toString() || `${s.name}-${s.email}`;
      uniqueStudentIds.add(id);
    });

    const totalOffers = allStudents.length;
    const studentsSelected = uniqueStudentIds.size;
    const doubleOffers = totalOffers - studentsSelected;

    // 2. STIPEND LOGIC (For your other missing cards)
    const stipends = allStudents.map(s => parseFloat(s.stipend || 0)).filter(s => s > 0);

    res.status(200).json({
      totalOffers,
      studentsSelected,
      doubleOffers,
      highestStipend: stipends.length ? Math.max(...stipends).toLocaleString() : 0,
      lowestStipend: stipends.length ? Math.min(...stipends).toLocaleString() : 0,
      avgStipend: stipends.length ? Math.round(stipends.reduce((a, b) => a + b, 0) / stipends.length).toLocaleString() : 0,
      departmentWise: Object.entries(
        allStudents.reduce((acc, s) => {
          acc[s.department] = (acc[s.department] || 0) + 1;
          return acc;
        }, {})
      ).map(([department, percentage]) => ({ department, percentage })),
      companies: [] // Aggregate your company data here
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getLastSevenDaysInternships = async (req, res) => {
  try {
    const studentId= req.user?.userId;
    // Fetch the student's details to get their batch and course
      const student = await Student.findById(studentId).select('batch course');
      if (!student) {
      console.error('Student not found:', studentId);
      return res.status(404).json({ error: 'Student not found' });
    }

    const { batch, course } = student;

    const today = new Date();
    const startOfLastSevenDays = new Date();
    startOfLastSevenDays.setDate(today.getDate() - 7);
    startOfLastSevenDays.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const internships = await SummerIntern.find({
      $and: [
        {
          $expr: {
            $and: [
              {
                $gte: [
                  {
                    $cond: {
                      if: { $eq: [{ $type: '$createdAt' }, 'date'] },
                      then: '$createdAt',
                      else: { $dateFromString: { dateString: '$createdAt' } },
                    },
                  },
                  startOfLastSevenDays,
                ],
              },
              {
                $lte: [
                  {
                    $cond: {
                      if: { $eq: [{ $type: '$createdAt' }, 'date'] },
                      then: '$createdAt',
                      else: { $dateFromString: { dateString: '$createdAt' } },
                    },
                  },
                  endOfToday,
                ],
              },
            ],
          },
        },
        { batch: batch }, // Match student's batch
        { course: course }, // Match student's course
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json(internships);
  } catch (error) {
    console.error("Error fetching last 7 days internships:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCombinedInsights = async (req, res) => {
  try {
    const batch = req.query.batch || "2022"; // Default to 2022
    const degree = req.query.degree || "B.Tech"; // Default to B.Tech

    const filter = {};
    if (batch) filter.batch = batch;
    if (degree) filter.degree = degree;

    const departmentData = await Internship.aggregate([
      { $match: filter },
      { $unwind: "$shortlisted_students" },
      {
        $group: {
          _id: "$shortlisted_students.department",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const stipendData = await Internship.aggregate([
      { $match: filter },
      { $unwind: "$shortlisted_students" },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: [{ $toDouble: "$stipend" }, 10000] },
              "<10K",
              {
                $cond: [
                  {
                    $and: [
                      { $gte: [{ $toDouble: "$stipend" }, 10000] },
                      { $lt: [{ $toDouble: "$stipend" }, 20000] },
                    ],
                  },
                  "10K-20K",
                  ">20K",
                ],
              },
            ],
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      departmentWise: departmentData,
      stipendWise: stipendData,
    });
  } catch (error) {
    console.error("Error fetching combined internship insights:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};