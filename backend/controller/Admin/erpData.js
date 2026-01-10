import axios from "axios";
import { encryptValue, decryptValue } from "../../utils/security.js";

export const getERPData = async (req, res) => {
  try {
    const { rollno } = req.query;

    if (!rollno) {
      return res.status(400).json({
        success: false,
        message: "Roll number or name is required",
      });
    }

    // ERP expects roll numbers, so we normalize input
    let rollNumbers = [];

    if (rollno) {
      rollNumbers = [rollno.trim()];
    } else {
      // Optional: if ERP supports name search
      return res.status(400).json({
        success: false,
        message: "ERP search by name not supported yet",
      });
    }

    const payload = {
      rollNumbers,
      portalKey: process.env.ERP_IDENTITY_SECRET,
    };

    const encrypted = encryptValue(JSON.stringify(payload));

    const response = await axios.post(process.env.ERP_SERVER, encrypted, {
      timeout: 20000,
    });

    if (!response?.data?.data) {
      throw new Error("Invalid ERP response");
    }
    
    const erpStudents = JSON.parse(decryptValue(response.data.data)) || [];

    if (!erpStudents.length) {
      return res.status(404).json({
        success: false,
        message: "No student found in ERP",
      });
    }

    // Normalize ERP response
    const student = erpStudents[0];

    const normalized = {
      rollno: student.rollno,
      name: student.name || "",
      department: student.department || "",
      course: student.course || "",
      batch: student.batch || "",
      gender: student.gender || "",
      category: student.category || "",
      cgpa: Number(student.cgpa) || 0,
      active_backlogs: student.active_backlogs === "true",
      backlogs_history: student.backlogs_history === "true",
      activeBacklogCount: Number(student.activeBacklogCount) || 0,
    };

    return res.status(200).json({
      success: true,
      data: normalized,
    });
  } catch (err) {
    console.error("ERP dashboard error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ERP data",
      error: err.message,
    });
  }
};
