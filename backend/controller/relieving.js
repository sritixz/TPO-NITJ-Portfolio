// import mongoose from 'mongoose';
import Relieving from "../models/relieving.js";
import Department from "../models/user_model/department.js";
import fs from "fs";
import path from "path";
import axios from "axios";
import Student from "../models/user_model/student.js";
import { encryptValue, decryptValue } from "../utils/security.js";

// export const getAllNOCstoprofessors = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const nocs = await NOC.find()
//       .skip(skip)
//       .limit(limit);

//     const total = await NOC.countDocuments();

//     res.status(200).json({
//       nocs,
//       total,
//       currentPage: page,
//       totalPages: Math.ceil(total / limit)
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const getLockedNOCsForProfessors = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch only locked NOCs
    const [nocs, total] = await Promise.all([
      Relieving.find({ locked: true })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),

      Relieving.countDocuments({ locked: true }),
    ]);

    res.status(200).json({
      nocs,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateNOCStatus = async (req, res) => {
  console.log(req.params);
  try {
    const { nocStatus, id } = req.params; // Pending, Issued, Rejected

    // Allow only valid statuses
    const allowedStatuses = ["Pending", "Issued", "Rejected"];
    if (!allowedStatuses.includes(nocStatus)) {
      return res.status(400).json({ error: "Invalid Relieving Letter status" });
    }

    if (!id) {
      return res.status(400).json({ error: "Relieving Letter Id is required" });
    }

    const updatedNOC = await Relieving.findOneAndUpdate(
      { _id: id },
      { nocStatus },
      { new: true },
    );

    if (!updatedNOC) {
      console.log("Relieving Letter not found");
      return res.status(404).json({ error: "Relieving Letter not found" });
    }

    res.status(200).json({
      message: `Relieving Letter status updated to ${nocStatus}`,
      noc: updatedNOC,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateNOCByProfessor = async (req, res) => {
  try {
    const id = req.params.id;

    const noc = await Relieving.findOne({ _id: id });
    if (!noc) return res.status(404).json({ message: "Relieving Letter not found" });
    
    const data = parseNestedFormData(req.body);

    if (data.purpose === "FTE") {
      if (!data.dateOfJoining) {
        return res
          .status(400)
          .json({ message: "Date of Joining required for FTE" });
      }

      data.internshipFrom = null;
      data.internshipTo = null;
    }

    if (data.purpose === "Internship") {
      if (!data.internshipFrom || !data.internshipTo) {
        return res.status(400).json({ message: "Internship dates required" });
      }

      data.dateOfJoining = null;
    }
    
    data.ownStartup = data.internshipMode === "Own Startup";
    data.companyminAgeis3 = data.companyminAgeis3 === "Yes";

    if (data.internshipFrom)
      data.internshipFrom = new Date(data.internshipFrom);
    if (data.internshipTo) data.internshipTo = new Date(data.internshipTo);

    const fields = [
      "offerLetter",
      "turnoverReport",
      "mailScreenshot",
      "startupIndiaRecognitionCertificate",
      "signature",
    ];

    fields.forEach((field) => {
      if (req.files[field]) {
        // delete old file
        if (noc[field]) {
          const oldFilePath = path.join(__dirname, "..", noc[field]);
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        }

        // set new file path
        data[field] = toRelativePath(req.files[field][0].path);
      }
    });

    Object.assign(noc, data);
    await noc.save();

    res.json(noc);
  } catch (error) {
    console.error("Error updating Relieving Letter:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getAllNOCstodepartments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // const departmentId = req.user.userId;
    // const departmentUser = await Department.findOne({ _id: departmentId });

    // if (!departmentUser) {
    //   return res.status(404).json({ error: "Department not found" });
    // }
    // const filter = {
    //   department: { $in: departmentUser.departments },
    // };

    const filter = { locked: true };

    /*const nocs = await Relieving.find(filter).skip(skip).limit(limit);
    const total = await Relieving.countDocuments();*/

    const [nocs, total] = await Promise.all([
      Relieving.find(filter)
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(limit),
      Relieving.countDocuments(filter), 
    ]);

    res.status(200).json({
      nocs,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNOCById = async (req, res) => {
  try {
    const noc = await Relieving.findById(req.params.id);
    if (!noc) return res.status(404).json({ message: "Relieving Letter not found" });
    res.status(200).json(noc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteNOC = async (req, res) => {
  try {
    const noc = await Relieving.findById(req.params.id);
    if (!noc) return res.status(404).json({ message: "Relieving Letter not found" });

    if (noc.locked)
      return res
        .status(403)
        .json({ message: "Relieving Letter is locked and cannot be deleted" });

    const fileFields = [
      "offerLetter",
      "turnoverReport",
      "mailScreenshot",
      "startupIndiaRecognitionCertificate",
      "signature",
    ];

    for (const field of fileFields) {
      if (noc[field]) {
        const fullPath = path.join(process.cwd(), noc[field]);
        try {
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            try {
              const dir = path.dirname(fullPath);
              const files = fs.readdirSync(dir);
              if (files.length === 0) fs.rmdirSync(dir);
            } catch (err) {}
          } else {
            console.warn(`File not found, skipping deletion: ${fullPath}`);
          }
        } catch (err) {
          console.error(`Error deleting file ${fullPath}:`, err);
        }
      }
    }

    await Relieving.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Relieving Letter deleted and related files removed" });
  } catch (err) {
    console.error("Error deleting Relieving Letter:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getNOCs = async (req, res) => {
  try {
    const nocs = await Relieving.find({ studentId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(nocs);
  } catch (error) {
    console.error("Error fetching Relieving Letters:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const lockNOC = async (req, res) => {
  try {
    const { id } = req.params;
    const noc = await Relieving.findById(id);
    if (!noc) {
      return res.status(404).json({ message: "Relieving Letter not found" });
    }
    if (noc.locked) {
      return res.status(400).json({ message: "Relieving Letter is already locked" });
    }
    noc.locked = true;
    await noc.save();
    return res.status(200).json({
      message: "Relieving Letter locked successfully",
      noc,
    });
  } catch (error) {
    console.error("Error locking Relieving Letter:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

function getTodayDateString() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yy = String(today.getFullYear()).slice(2);
  return `${dd}${mm}${yy}`; // e.g. 310525
}

const parseNestedFormData = (formData) => {
  const data = {};
  for (let [key, value] of Object.entries(formData)) {
    if (key.includes("[") && key.includes("]")) {
      const match = key.match(/^(.*)\[([^\]]+)\]$/);
      if (match) {
        const parent = match[1];
        const child = match[2];
        if (!data[parent]) data[parent] = {};
        data[parent][child] = value;
      } else {
        data[key] = value;
      }
    } else {
      data[key] = value;
    }
  }
  return data;
};

const toRelativePath = (fullPath) => {
  const index = fullPath.indexOf("uploads");
  return fullPath.substring(index).replace(/\\/g, "/");
};

export const createNOC = async (req, res) => {
  try {
    //fetching student active backlog count
    const studentId = req.user.userId;
    const student = await Student.findById(studentId).select("rollno");
    const rollNumbers = [student.rollno];
    const payload = { rollNumbers, portalKey: process.env.ERP_IDENTITY_SECRET };
    const encryptedData = encryptValue(JSON.stringify(payload));

    ////////////////////////////////Uncomment/////////////////////////
    // const response = await axios.post(
    //   `${process.env.ERP_SERVER}`,
    //   encryptedData,
    // );
    // const erpStudents = response.data.data;
    // const decryptedData = decryptValue(erpStudents);
    // const erpData = JSON.parse(decryptedData)[0];
    ////////////////////////////////Uncomment/////////////////////////

    ////////////////////////////////Remove/////////////////////////
    // --- MOCK ERP DATA FOR TESTING ---
const erpData = {
    cgpa: "8.96",
    active_backlogs: "false",
    activeBacklogCount: 0
};
console.log("🛠️ ERP Timeout Bypassed in Relieving Controller.");
////////////////////////////////Remove/////////////////////////

    //starting creation process
    const data = parseNestedFormData(req.body);
    if (data.purpose === "FTE") {
      if (!data.dateOfJoining) {
        return res
          .status(400)
          .json({ message: "Date of Joining required for FTE" });
      }

      data.internshipFrom = null;
      data.internshipTo = null;
    }

    if (data.purpose === "Internship") {
      if (!data.internshipFrom || !data.internshipTo) {
        return res.status(400).json({ message: "Internship dates required" });
      }

      data.dateOfJoining = null;
    }

    if (
      erpData.activeBacklogCount > 3 &&
      (data.internshipMode == "Own Startup" ||
        data.internshipMode == "Off-Campus")
    )
      return res.status(400).json({
        eligible: false,
        message:
          "You have more than 3 active backlogs. You cannot go to Internship as per Internship policy.",
      });

    data.studentId = req.user.userId;
    const dateStr = getTodayDateString();
    data.nocId = `CTP/REL/${dateStr}/`;

    data.ownStartup = data.internshipMode === "Own Startup";
    data.companyminAgeis3 = data.companyminAgeis3 === "Yes";

    if (data.internshipFrom)
      data.internshipFrom = new Date(data.internshipFrom);
    if (data.internshipTo) data.internshipTo = new Date(data.internshipTo);

    // Attach file paths
    const fields = [
      "offerLetter",
      "turnoverReport",
      "mailScreenshot",
      "startupIndiaRecognitionCertificate",
      "signature",
    ];

    fields.forEach((field) => {
      if (req.files[field]) {
        data[field] = toRelativePath(req.files[field][0].path);
      }
    });

    const noc = new Relieving(data);
    await noc.save();

    res.status(201).json(noc);
  } catch (error) {
    console.error("Error creating Relieving Letter:", error);
    res.status(400).json({ message: error.message });
  }
};

// ---------------------------
// UPDATE NOC
// ---------------------------
export const updateNOC = async (req, res) => {
  try {
    const id = req.params.id;

    const noc = await Relieving.findOne({ _id: id, studentId: req.user.userId });
    if (!noc) return res.status(404).json({ message: "Relieving Letter not found" });

    if (noc.locked)
      return res
        .status(403)
        .json({ message: "Relieving Letter is locked and cannot be edited" });

    const data = parseNestedFormData(req.body);

    if (data.purpose === "FTE") {
      data.internshipFrom = null;
      data.internshipTo = null;
      data.internshipDuration = null;
    }

    if (data.purpose === "Internship") {
      data.dateOfJoining = null; 
    }

    data.ownStartup = data.internshipMode === "Own Startup";
    data.companyminAgeis3 = data.companyminAgeis3 === "Yes";

    if (data.internshipFrom)
      data.internshipFrom = new Date(data.internshipFrom);
    if (data.internshipTo) data.internshipTo = new Date(data.internshipTo);

    const fields = [
      "offerLetter",
      "turnoverReport",
      "mailScreenshot",
      "startupIndiaRecognitionCertificate",
      "signature",
    ];

    fields.forEach((field) => {
      if (req.files[field]) {
        // delete old file
        if (noc[field]) {
          const oldFilePath = path.join(__dirname, "..", noc[field]);
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        }

        // set new file path
        data[field] = toRelativePath(req.files[field][0].path);
      }
    });

    Object.assign(noc, data);
    await noc.save();

    res.json(noc);
  } catch (error) {
    console.error("Error updating Relieving Letter:", error);
    res.status(400).json({ message: error.message });
  }
};

// ---------------------------
// UPLOAD DOCUMENT (Single Route)
// ---------------------------
export const uploadDocument = async (req, res) => {
  try {
    const id = req.params.id;

    const noc = await Relieving.findOne({ _id: id, studentId: req.user.userId });
    if (!noc) return res.status(404).json({ message: "Relieving Letter not found" });

    const field = req.file.fieldname;

    // Delete old file
    if (noc[field]) {
      const oldFilePath = path.join(__dirname, "..", noc[field]);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    }

    // Save new file
    noc[field] = req.file.path.replace(/\\/g, "/");
    await noc.save();

    res.json(noc);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getRelievingDetailsForDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.userId; 

    const noc = await Relieving.findById(id);

    if (!noc) {
      return res.status(404).json({ message: "Relieving Letter not found." });
    }

    if (noc.nocStatus !== "Issued") {
      return res.status(403).json({ 
        message: "Forbidden: This letter has not been officially issued by the TPO." 
      });
    }

    if (noc.studentId.toString() !== studentId) {
      return res.status(401).json({ message: "Unauthorized: You do not own this record." });
    }

    res.status(200).json(noc);

  } catch (error) {
    console.error("Download Security Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};