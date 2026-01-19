import Offer from '../models/offer.js';
import SummerIntern from '../models/summer_internship.js';
import Student from '../models/user_model/student.js';

export const getPlacementReports = async (req, res) => {
  try {
    console.log('Query parameters:', req.query);
    const { batch, degree, department, type } = req.query;
    const filter = {};
    if (batch) filter.batch = batch;
    if (degree) filter.course = degree; // Map 'degree' from query to 'course' in models
    if (department) filter['shortlisted_students.department'] = department;

    let results = [];

    // Handle Placement (Offer) data
    if (!type || type === 'placement') {
      const offers = await Offer.find(filter).populate('shortlisted_students.studentId');
      const offerData = offers.flatMap(offer => {
        return offer.shortlisted_students
          .filter(student => !department || student.department?.toLowerCase() === department.toLowerCase())
          .map((student, index) => {
            const studentData = student.studentId;
            console.log('studentData:', studentData);
            return {
              id: `O-${offer._id}-${index}`,
              roll_no: studentData ? studentData.rollno : 'N/A',
              name: student.name,
              branch: student.department,
              gender: student.gender ? student.gender.charAt(0) : 'N/A',
              category: student.category || 'N/A',
              date_result: offer.result_date ? new Date(offer.result_date).toLocaleDateString() : 'N/A',
              profile: student.job_role || 'N/A',
              company: offer.company_name || 'N/A',
              package: student.ctc || 'N/A',
              student_status: student.job_type || 'Placed',
              placement_type: 'Placement',
              batch: offer.batch,
              degree: offer.course,
              stipend: student.stipend || 'N/A'
            };
          });
      });
      results = [...results, ...offerData];
    }

    // Handle Summer Internship data
    if (!type || type === 'summer_intern') {
      const internships = await SummerIntern.find(filter).populate('shortlisted_students.studentId');
      const internshipData = internships.flatMap(internship => {
        return internship.shortlisted_students
          .filter(student => !department || student.department?.toLowerCase() === department.toLowerCase())
          .map((student, index) => {
            const studentData = student.studentId;
            return {
              id: `SI-${internship._id}-${index}`,
              roll_no: studentData ? studentData.rollno : 'N/A',
              name: student.name,
              branch: student.department,
              gender: student.gender ? student.gender.charAt(0) : 'N/A',
              category: student.category || 'N/A',
              date_result: internship.result_date ? new Date(internship.result_date).toLocaleDateString() : 'N/A',
              profile: student.job_role || 'Intern+PPO',
              company: internship.company_name || 'N/A',
              package: student.ctc || 'N/A',
              student_status: student.job_type || 'Intern',
              placement_type: 'Summer Internship',
              duration: student.intern_duration || 'N/A',
              batch: internship.batch,
              degree: internship.course,
              stipend: student.stipend || 'N/A'
            };
          });
      });
      results = [...results, ...internshipData];
    }

    // Group results by department and assign sr_no starting from 1 for each department
    const departmentGroups = {};
    results.forEach(item => {
      const dept = item.branch || 'Unknown'; // Fallback to 'Unknown' if branch is undefined
      if (!departmentGroups[dept]) {
        departmentGroups[dept] = [];
      }
      departmentGroups[dept].push(item);
    });

    // Assign sr_no starting from 1 for each department
    let finalResults = [];
    Object.keys(departmentGroups).forEach(dept => {
      const deptRecords = departmentGroups[dept].map((item, index) => ({
        ...item,
        sr_no: index + 1 // Start sr_no from 1 for each department
      }));
      finalResults = [...finalResults, ...deptRecords];
    });

    // Sort results by department and then sr_no
    finalResults.sort((a, b) => {
      const deptA = a.branch || 'Unknown';
      const deptB = b.branch || 'Unknown';
      if (deptA === deptB) return a.sr_no - b.sr_no;
      return deptA.localeCompare(deptB);
    });

    // Count multiple placements/internships for double placement detection
    const studentCounts = {};
    finalResults.forEach(item => {
      studentCounts[item.roll_no] = (studentCounts[item.roll_no] || 0) + 1;
    });

    // Add isDoublePlaced flag
    finalResults = finalResults.map(item => ({
      ...item,
      isDoublePlaced: studentCounts[item.roll_no] > 1
    }));

    res.status(200).json({
      success: true,
      results: finalResults,
      count: finalResults.length
    });
  } catch (error) {
    console.error('Error fetching placement reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch placement reports',
      error: error.message
    });
  }
};



export const getStudentConnect = async (req, res) => {
  try {
    console.log('Query parameters:', req.query);
    const { batch, degree, department, type } = req.query;
    const filter = {};
    if (batch) filter.batch = batch;
    if (degree) filter.course = degree; // Map 'degree' from query to 'course' in models
    if (department) filter['shortlisted_students.department'] = department;

    let results = [];

    // Handle Placement (Offer) data
    if (!type || type === 'placement') {
      const offers = await Offer.find(filter).populate('shortlisted_students.studentId');
      const offerData = offers.flatMap(offer => {
        return offer.shortlisted_students
          .filter(student => !department || student.department?.toLowerCase() === department.toLowerCase())
          .map((student, index) => {
            const studentData = student.studentId;
            console.log('studentData:', studentData);
            return {
              id: `O-${offer._id}-${index}`,
              roll_no: studentData ? studentData.rollno : 'N/A',
              name: student.name,
              branch: student.department,
              gender: student.gender ? student.gender.charAt(0) : 'N/A',
              profile: student.job_role || 'N/A',
              company: offer.company_name || 'N/A',
              placement_type: 'Placement',
              batch: offer.batch,
              degree: offer.course,
              linkedin: studentData ? studentData.linkedin : 'N/A'
            };
          });
      });
      results = [...results, ...offerData];
    }

    // Handle Summer Internship data
    if (!type || type === 'summer_intern') {
      const internships = await SummerIntern.find(filter).populate('shortlisted_students.studentId');
      const internshipData = internships.flatMap(internship => {
        return internship.shortlisted_students
          .filter(student => !department || student.department?.toLowerCase() === department.toLowerCase())
          .map((student, index) => {
            const studentData = student.studentId;
            return {
              id: `SI-${internship._id}-${index}`,
              roll_no: studentData ? studentData.rollno : 'N/A',
              name: student.name,
              branch: student.department,
              gender: student.gender ? student.gender.charAt(0) : 'N/A',
              profile: student.job_role || 'N/A',
              company: internship.company_name || 'N/A',
              placement_type: 'Summer Internship',
              duration: student.intern_duration || 'N/A',
              batch: internship.batch,
              degree: internship.course,
              linkedin: studentData ? studentData.linkedin : 'N/A'
            };
          });
      });
      results = [...results, ...internshipData];
    }

    // Group results by department and assign sr_no starting from 1 for each department
    const departmentGroups = {};
    results.forEach(item => {
      const dept = item.branch || 'Unknown'; // Fallback to 'Unknown' if branch is undefined
      if (!departmentGroups[dept]) {
        departmentGroups[dept] = [];
      }
      departmentGroups[dept].push(item);
    });

    // Assign sr_no starting from 1 for each department
    let finalResults = [];
    Object.keys(departmentGroups).forEach(dept => {
      const deptRecords = departmentGroups[dept].map((item, index) => ({
        ...item,
        sr_no: index + 1 // Start sr_no from 1 for each department
      }));
      finalResults = [...finalResults, ...deptRecords];
    });

    // Sort results by department and then sr_no
    finalResults.sort((a, b) => {
      const deptA = a.branch || 'Unknown';
      const deptB = b.branch || 'Unknown';
      if (deptA === deptB) return a.sr_no - b.sr_no;
      return deptA.localeCompare(deptB);
    });

    // Count multiple placements/internships for double placement detection
    const studentCounts = {};
    finalResults.forEach(item => {
      studentCounts[item.roll_no] = (studentCounts[item.roll_no] || 0) + 1;
    });

    // Add isDoublePlaced flag
    finalResults = finalResults.map(item => ({
      ...item,
      isDoublePlaced: studentCounts[item.roll_no] > 1
    }));

    res.status(200).json({
      success: true,
      results: finalResults,
      count: finalResults.length
    });
  } catch (error) {
    console.error('Error fetching placement reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch placement reports',
      error: error.message
    });
  }
};

