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
    const { students } = req.body;

    if (!students || !students.length) {
      return res.status(400).json({ message: "No students provided" });
    }

    const bulkOps = students.map((s) => ({
      updateOne: {
        filter: { rollno: String(s.rollno).trim() },
        update: { $set: s },
      },
    }));

    await Student.bulkWrite(bulkOps);

    res.status(200).json({
      message: "Existing students updated successfully",
      updatedCount: students.length,
    });
  } catch (error) {
    console.error("Update existing error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};
