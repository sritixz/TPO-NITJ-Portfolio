import XLSX from "xlsx";
import Student from "../../models/user_model/student.js";
import { normalizeStudent } from "../../utils/adminMulter.js";

export const uploadStudentsExcel = async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const rows = rawRows.map((row) => {
      const cleanRow = {};
      Object.keys(row).forEach((key) => {
        cleanRow[key.trim()] = row[key];
      });
      return cleanRow;
    });

    const normalizedStudents = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const student = await normalizeStudent(rows[i]);
        normalizedStudents.push(student);
      } catch (err) {
        errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    if (errors.length) {
      console.log("Excel validation errors:", errors);
      return res.status(400).json({ errors });
    }

    const rollnos = normalizedStudents.map((s) => s.rollno);

    const existing = await Student.find({
      rollno: { $in: rollnos },
    });

    const existingMap = new Map(existing.map((s) => [s.rollno, s]));

    const newStudents = [];
    const existingStudents = [];

    normalizedStudents.forEach((student) => {
      if (existingMap.has(student.rollno)) {
        existingStudents.push(student);
      } else {
        newStudents.push(student);
      }
    });

    if (newStudents.length) {
      await Student.insertMany(newStudents);
    }

    return res.status(200).json({
      insertedCount: newStudents.length,
      existingStudents, // send for confirmation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Excel upload failed" });
  }
};

export const updateExistingStudents = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("STUDENTS:", req.body?.students);

    const { students } = req.body;

    if (!Array.isArray(students) || !students.length) {
      return res.status(400).json({ message: "No students provided" });
    }

    let updatedCount = 0;
    let failed = [];
    for (const student of students) {
      try {
        if (!student.rollno) continue;

        const updatePayload = {
          name: student.name,
          email: student.email,

          department: student.department,
          course: student.course,
          batch: student.batch,
          gender: student.gender,
          category: student.category,
          cgpa: student.cgpa || "",

          disability:
            typeof student.disability === "string"
              ? student.disability.toLowerCase() === "yes"
              : Boolean(student.disability),

          erpLastUpdated: new Date(),
        };

        const result = await Student.updateOne(
          { rollno: String(student.rollno).trim() },
          { $set: updatePayload },
          { runValidators: false }
        );

        if (result.modifiedCount > 0) updatedCount++;
      } catch (err) {
        console.error("Failed for rollno:", student.rollno, err.message);
        failed.push(student.rollno);
      }
    }

    return res.status(200).json({
      message: "Update completed",
      updatedCount,
      failed,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Failed to update existing students",
      error:err
    });
  }
};
