import axios from 'axios';
import Student from '../models/user_model/student.js';

export const validateCgpa = async (req, res) => {
  try {
    const { students, emailColumn, cgpaColumn, isCgpaPercentage } = req.body;

    if (!students || !emailColumn || !cgpaColumn) {
      return res.status(400).json({ error: 'Missing required fields: students, emailColumn, or cgpaColumn' });
    }

    console.log('Input students:', students);

    const emails = students.map(student => student[emailColumn]).filter(email => email);
    console.log('Emails:', emails);

    const dbStudents = await Student.find({ email: { $in: emails } }).select('name email rollno cgpa').catch(err => {
      console.error('Database query error:', err);
      throw new Error('Database query failed');
    });

    console.log('DB Students:', dbStudents);

    if (!dbStudents.length) {
      return res.status(404).json({ error: 'No students found with the provided emails' });
    }

    const studentMap = dbStudents.reduce((map, student) => {
      map[student.email] = { rollno: student.rollno, cgpa: student.cgpa, name: student.name };
      return map;
    }, {});

    const rollNumbers = dbStudents.map(student => student.rollno);
    console.log('Roll Numbers:', rollNumbers);

    const apiResponse = await axios.post(`${process.env.ERP_SERVER}`, rollNumbers, {
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(err => {
      console.error('ERP API Error:', err.response?.data || err.message);
      throw new Error('ERP API request failed');
    });

    console.log('API Response:', apiResponse.data);

    const apiData = Array.isArray(apiResponse.data) ? apiResponse.data : apiResponse.data.data || [];
    if (!apiData.length) {
      return res.status(500).json({ error: 'Invalid API response: No CGPA data received' });
    }

    const apiCgpaMap = apiData.reduce((map, item) => {
      if (item.rollno && item.cgpa !== undefined) {
        map[item.rollno] = item.cgpa;
      }
      return map;
    }, {});

    console.log('API CGPA Map:', apiCgpaMap);

    const results = students
      .filter(student => studentMap[student[emailColumn]])
      .map(student => {
        const email = student[emailColumn];
        const uploadedCgpa = parseFloat(student[cgpaColumn]);
        const dbStudent = studentMap[email];
        const correctCgpa = parseFloat(apiCgpaMap[dbStudent.rollno]) || 0;

        if (isNaN(uploadedCgpa) || isNaN(correctCgpa)) {
          return {
            name: dbStudent.name || 'Unknown',
            email: email,
            uploadedCgpa: isNaN(uploadedCgpa) ? 'Invalid' : uploadedCgpa.toFixed(2),
            correctCgpa: isNaN(correctCgpa) ? 'N/A' : correctCgpa.toFixed(2),
            isValid: false,
          };
        }

        let isValid = false;
        if (isCgpaPercentage) {
          const convertedCorrectCgpa = correctCgpa * 10;
          isValid = Math.abs(uploadedCgpa - convertedCorrectCgpa) < 0.01;
          return {
            name: dbStudent.name || 'Unknown',
            email: email,
            uploadedCgpa: uploadedCgpa.toFixed(2),
            correctCgpa: convertedCorrectCgpa.toFixed(2),
            isValid,
          };
        } else {
          isValid = Math.abs(uploadedCgpa - correctCgpa) < 0.01;
          return {
            name: dbStudent.name || 'Unknown',
            email: email,
            uploadedCgpa: uploadedCgpa.toFixed(2),
            correctCgpa: correctCgpa.toFixed(2),
            isValid,
          };
        }
      });

    res.status(200).json({ results });
  } catch (error) {
    console.error('Error validating CGPA:', error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};