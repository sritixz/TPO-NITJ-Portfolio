import Offer from "../models/offer.js";
import SummerIntern from "../models/summer_internship.js";

const normalize = (v) => v?.toLowerCase().replace(/\./g, "");

export const getPlacementReports = async (req, res) => {
  try {
    const { batch, degree, department, type } = req.query;

    const filter = {};
    if (batch) filter.batch = batch;
    if (department) filter["shortlisted_students.department"] = department;

    let results = [];

    /* ===================== PLACEMENTS ===================== */
    if (!type || type === "placement") {
      const offers = await Offer.find(filter).populate({
        path: "shortlisted_students.studentId",
        select: "rollno course linkedin",
      });

      const offerData = offers.flatMap((offer) =>
        offer.shortlisted_students
          .filter((student) => {
            const s = student.studentId;
            return (
              s &&
              (!department || student.department === department) &&
              (!degree || normalize(s.course) === normalize(degree))
            );
          })
          .map((student, index) => {
            const s = student.studentId;
            return {
              id: `O-${offer._id}-${index}`,
              roll_no: s?.rollno || "N/A",
              name: student.name,
              branch: student.department,
              gender: student.gender ? student.gender.charAt(0) : "N/A",
              category: student.category || "N/A",
              date_result: offer.result_date
                ? new Date(offer.result_date).toLocaleDateString()
                : "N/A",
              profile: student.job_role || "N/A",
              company: offer.company_name || "N/A",
              package: student.ctc || "N/A",
              student_status: student.job_type || "Placed",
              placement_type: "Placement",
              batch: offer.batch,
              degree: s?.course || "N/A", // ✅ FIXED
            };
          })
      );

      results.push(...offerData);
    }

    /* ===================== SUMMER INTERNSHIPS ===================== */
    if (!type || type === "summer_intern") {
      const internships = await SummerIntern.find(filter).populate({
        path: "shortlisted_students.studentId",
        select: "rollno course linkedin",
      });

      const internshipData = internships.flatMap((internship) =>
        internship.shortlisted_students
          .filter((student) => {
            const s = student.studentId;
            return (
              s &&
              (!department || student.department === department) &&
              (!degree || normalize(s.course) === normalize(degree))
            );
          })
          .map((student, index) => {
            const s = student.studentId;
            return {
              id: `SI-${internship._id}-${index}`,
              roll_no: s?.rollno || "N/A",
              name: student.name,
              branch: student.department,
              gender: student.gender ? student.gender.charAt(0) : "N/A",
              category: student.category || "N/A",
              date_result: internship.result_date
                ? new Date(internship.result_date).toLocaleDateString()
                : "N/A",
              profile: student.job_role || "Intern+PPO",
              company: internship.company_name || "N/A",
              package: student.stipend || "N/A",
              student_status: student.job_type || "Intern",
              placement_type: "Summer Internship",
              duration: student.intern_duration || "N/A",
              batch: internship.batch,
              degree: s?.course || "N/A", // ✅ FIXED
            };
          })
      );

      results.push(...internshipData);
    }

    /* ===================== SR NO + SORT ===================== */
    const deptGroups = {};
    results.forEach((r) => {
      const d = r.branch || "Unknown";
      if (!deptGroups[d]) deptGroups[d] = [];
      deptGroups[d].push(r);
    });

    let finalResults = [];
    Object.values(deptGroups).forEach((rows) => {
      rows.forEach((r, i) => {
        finalResults.push({ ...r, sr_no: i + 1 });
      });
    });

    finalResults.sort((a, b) =>
      (a.branch || "").localeCompare(b.branch || "") || a.sr_no - b.sr_no
    );

    /* ===================== DOUBLE PLACED ===================== */
    const countMap = {};
    finalResults.forEach((r) => {
      countMap[r.roll_no] = (countMap[r.roll_no] || 0) + 1;
    });

    finalResults = finalResults.map((r) => ({
      ...r,
      isDoublePlaced: countMap[r.roll_no] > 1,
    }));

    res.json({
      success: true,
      results: finalResults,
      count: finalResults.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch placement reports",
    });
  }
};

export const getStudentConnect = async (req, res) => {
  try {
    const { batch, degree, department, type } = req.query;

    const filter = {};
    if (batch) filter.batch = batch;
    if (department) filter["shortlisted_students.department"] = department;

    let results = [];

    if (!type || type === "placement") {
      const offers = await Offer.find(filter).populate({
        path: "shortlisted_students.studentId",
        select: "rollno course linkedin",
      });

      results.push(
        ...offers.flatMap((offer) =>
          offer.shortlisted_students
            .filter((s) => {
              const sd = s.studentId;
              return (
                sd &&
                (!department || s.department === department) &&
                (!degree || normalize(sd.course) === normalize(degree))
              );
            })
            .map((s, i) => ({
              id: `O-${offer._id}-${i}`,
              roll_no: s.studentId.rollno,
              name: s.name,
              branch: s.department,
              gender: s.gender?.charAt(0) || "N/A",
              profile: s.job_role || "N/A",
              company: offer.company_name,
              placement_type: "Placement",
              batch: offer.batch,
              degree: s.studentId.course, // ✅ FIXED
              linkedin: s.studentId.linkedin || "N/A",
            }))
        )
      );
    }

    if (!type || type === "summer_intern") {
      const internships = await SummerIntern.find(filter).populate({
        path: "shortlisted_students.studentId",
        select: "rollno course linkedin",
      });

      results.push(
        ...internships.flatMap((internship) =>
          internship.shortlisted_students
            .filter((s) => {
              const sd = s.studentId;
              return (
                sd &&
                (!department || s.department === department) &&
                (!degree || normalize(sd.course) === normalize(degree))
              );
            })
            .map((s, i) => ({
              id: `SI-${internship._id}-${i}`,
              roll_no: s.studentId.rollno,
              name: s.name,
              branch: s.department,
              gender: s.gender?.charAt(0) || "N/A",
              profile: s.job_role || "N/A",
              company: internship.company_name,
              placement_type: "Summer Internship",
              duration: s.intern_duration || "N/A",
              batch: internship.batch,
              degree: s.studentId.course, // ✅ FIXED
              linkedin: s.studentId.linkedin || "N/A",
            }))
        )
      );
    }

    res.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student connect",
    });
  }
};
