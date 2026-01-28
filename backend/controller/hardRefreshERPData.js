import axios from "axios";
import Student from "../models/user_model/student.js";
import { encryptValue, decryptValue } from "../utils/security.js";

// utility
const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export const hardRefreshERPData = async (req, res) => {
  try {
    // 1️⃣ Fetch ONLY required students
    const students = await Student.find(
      {
        rollno: { $exists: true, $ne: "" },
        batch: "2027",
        course: "B.Tech",
        department: "INSTRUMENTATION AND CONTROL ENGINEERING",
      },
      { rollno: 1 }
    ).lean();

    if (!students.length) {
      return res.status(404).json({
        success: false,
        message: "No eligible students found for ERP sync",
      });
    }

    // 2️⃣ Rollno → _id map
    const rollnoToIdMap = new Map();
    students.forEach((s) => rollnoToIdMap.set(s.rollno, s._id));

    const rollNumbers = students.map((s) => s.rollno);

    // ⚡ batch size
    const rollChunks = chunkArray(rollNumbers, 20);

    const now = new Date();
    let totalERPRecords = 0;
    let studentsUpdated = 0;

    const CONCURRENCY = 2;
    let bulkOps = [];

    // 3️⃣ ERP fetch with limited concurrency
    for (let i = 0; i < rollChunks.length; i += CONCURRENCY) {
      const activeChunks = rollChunks.slice(i, i + CONCURRENCY);

      const promises = activeChunks.map(async (chunk) => {
        try {
          const payload = {
            rollNumbers: chunk,
            portalKey: process.env.ERP_IDENTITY_SECRET,
          };

          const encrypted = encryptValue(JSON.stringify(payload));

          const response = await axios.post(
            process.env.ERP_SERVER,
            encrypted,
            { timeout: 60000 }
          );

          const erpStudents =
            JSON.parse(decryptValue(response.data.data)) || [];

          totalERPRecords += erpStudents.length;

          erpStudents.forEach((erpStudent) => {
            const studentId = rollnoToIdMap.get(erpStudent.rollno);
            if (!studentId) return;

            bulkOps.push({
              updateOne: {
                filter: { _id: studentId },
                update: {
                  $set: {
                    cgpa: Number(erpStudent.cgpa) || 0,
                    active_backlogs:
                      erpStudent.active_backlogs === "true",
                    backlogs_history:
                      erpStudent.backlogs_history === "true",
                    activeBacklogCount:
                      Number(erpStudent.activeBacklogCount) || 0,
                    erpLastUpdated: now,
                  },
                },
              },
            });

            studentsUpdated++;
          });
        } catch (err) {
          console.error(
            `ERP batch failed (starting ${chunk[0]}):`,
            err.message
          );
        }
      });

      await Promise.all(promises);

      // flush DB every ~200 ops
      if (bulkOps.length >= 200) {
        await Student.bulkWrite(bulkOps);
        bulkOps = [];
      }

      // ⏳ ERP cooldown
      await new Promise((r) => setTimeout(r, 300));
    }

    // 4️⃣ Final DB flush
    if (bulkOps.length > 0) {
      await Student.bulkWrite(bulkOps);
    }

    return res.status(200).json({
      success: true,
      message:
        "ERP hard refresh completed for 2027 B.Tech ICE students",
      totalStudents: students.length,
      studentsUpdated,
      erpRecordsFetched: totalERPRecords,
    });
  } catch (error) {
    console.error("Hard ERP refresh failed:", error);
    return res.status(500).json({
      success: false,
      message: "ERP hard refresh failed",
      error: error.message,
    });
  }
};
