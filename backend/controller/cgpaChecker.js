import * as XLSX from 'xlsx';
import Student from '../models/user_model/student.js';
import axios from 'axios';
import { encryptValue, decryptValue } from "../utils/security.js";

export const validateCgpa = async (req, res) => {
  try {
    const { emailColumn, cgpaColumn, isCgpaPercentage } = req.body;
    const fileBuffer = req.file?.buffer;

    if (!fileBuffer || !emailColumn || !cgpaColumn) {
      return res.status(400).json({ error: 'Missing file or required fields' });
    }

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false });

    // Save original for frontend to use for download
    const originalData = jsonData;

    // Clean CGPA
    const cleanCgpa = (cgpa) => {
      if (!cgpa || typeof cgpa !== 'string') return cgpa;
      return cgpa.replace(/[^0-9.]/g, '');
    };

    const cleanedData = jsonData.map((row) => ({
      ...row,
      [cgpaColumn]: cleanCgpa(row[cgpaColumn]),
    }));

    const emails = cleanedData.map(student => student[emailColumn]).filter(Boolean);

    const dbStudents = await Student.find({ email: { $in: emails } }).select('name email rollno cgpa');

    if (!dbStudents.length) {
      return res.status(404).json({ error: 'No students found with the provided emails' });
    }

    const studentMap = dbStudents.reduce((map, student) => {
      map[student.email] = { rollno: student.rollno, cgpa: student.cgpa, name: student.name };
      return map;
    }, {});

    const rollNumbers = dbStudents.map(student => student.rollno);
    const payload = {rollNumbers, portalKey: process.env.ERP_IDENTITY_SECRET};
    const encryptedData = encryptValue(JSON.stringify(payload));
    const apiResponse = await axios.post(`${process.env.ERP_SERVER}`, encryptedData);
    // const apiData = Array.isArray(JSON.parse(decryptValue(apiResponse.data))) ? JSON.parse(decryptValue(apiResponse.data)) : JSON.parse(decryptValue(apiResponse.data.data)) || [];
    const apiData = JSON.parse(decryptValue(apiResponse.data.data)) || [];
    const apiCgpaMap = apiData.reduce((map, item) => {
      if (item.rollno && item.cgpa !== undefined) {
        map[item.rollno] = item.cgpa;
      }
      return map;
    }, {});

    const results = cleanedData
      .filter(student => studentMap[student[emailColumn]])
      .map(student => {
        const email = student[emailColumn];
        const uploadedCgpa = parseFloat(student[cgpaColumn]);
        const dbStudent = studentMap[email];
        const correctCgpa = parseFloat(apiCgpaMap[dbStudent.rollno]) || 0;

        if (isNaN(uploadedCgpa) || isNaN(correctCgpa)) {
          return {
            name: dbStudent.name || 'Unknown',
            email,
            uploadedCgpa: isNaN(uploadedCgpa) ? 'Invalid' : uploadedCgpa.toFixed(2),
            correctCgpa: isNaN(correctCgpa) ? 'N/A' : correctCgpa.toFixed(2),
            isValid: false,
          };
        }

        let isValid = false;
        if (isCgpaPercentage === 'true' || isCgpaPercentage === true) {
          const converted = correctCgpa * 10;
          isValid = Math.abs(uploadedCgpa - converted) < 0.01;
          return {
            name: dbStudent.name,
            email,
            uploadedCgpa: uploadedCgpa.toFixed(2),
            correctCgpa: converted.toFixed(2),
            isValid,
          };
        } else {
          isValid = Math.abs(uploadedCgpa - correctCgpa) < 0.01;
          return {
            name: dbStudent.name,
            email,
            uploadedCgpa: uploadedCgpa.toFixed(2),
            correctCgpa: correctCgpa.toFixed(2),
            isValid,
          };
        }
      });
    console.log("Response size (approx):", Buffer.byteLength(JSON.stringify({ results, originalData })) / 1024, "KB");

    res.status(200).json({ results, originalData });

  } catch (err) {
    console.error('Error validating CGPA:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
};
