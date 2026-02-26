import crypto from "crypto";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

import Student from "../models/user_model/student.js";
import ApplicationToken from "../models/ir_pr_application_token.js";
import RepresentativeApplication from "../models/ir_pr_application.js";

import axios from "axios";
import { encryptValue, decryptValue } from "../utils/security.js";

export const generateToken = async (req, res) => {
  const student = await Student.findById(req.user.userId);

  if (!student)
    return res.status(404).json({ message: "Student not found" });

  let updatedStudent;

  try {
    const payload = {
      rollNumbers: [student.rollno],
      portalKey: process.env.ERP_IDENTITY_SECRET,
    };

    const encryptedData = encryptValue(JSON.stringify(payload));

    const response = await axios.post(
      process.env.ERP_SERVER,
      encryptedData
    );

    const decryptedData = decryptValue(response.data.data);
    const erpData = JSON.parse(decryptedData)[0];

    const courseDurations = {
      "B.Tech": 4,
      "M.Tech": 2,
      "B.Sc.-B.Ed.": 4,
      MBA: 2,
      "M.Sc.": 2,
    };

    const adjustment = courseDurations[student.course] || 0;
    const adjustedBatch = String(Number(erpData.batch) + adjustment);

    updatedStudent = {
      ...student.toObject(),
      cgpa: Number(erpData.cgpa),
      batch: adjustedBatch,
      activeBacklog: erpData.active_backlogs === "true",
      backlogHistory: erpData.backlogs_history === "true",
      activeBacklogCount: Number(erpData.activeBacklogCount || 0),
    };

  } catch (err) {
    console.error("ERP error. Falling back to DB data:", err);
    updatedStudent = student.toObject();
  }

  // Eligibility Check (ERP-based)
  console.log("Answer", updatedStudent.cgpa, updatedStudent.activeBacklog, updatedStudent.backlogHistory)
  if (
    updatedStudent.cgpa < 7 ||
    updatedStudent.activeBacklog ||
    updatedStudent.backlogHistory
  ) {
    return res.status(403).json({
      message: "Not eligible to apply"
    });
  }

  // Auto Type Based on Adjusted Batch
  let type = null;
  if (updatedStudent.batch === "2028") type = "internship";
  if (updatedStudent.batch === "2027") type = "placement";

  if (!type)
    return res.status(400).json({ message: "Invalid batch for IR/PR" });

  // Prevent duplicate token flooding
  await ApplicationToken.deleteMany({ student: student._id });

  const token = crypto.randomBytes(32).toString("hex");

  await ApplicationToken.create({
    student: student._id,
    token,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  res.json({ token, type });
};

export const submitApplication = async (req, res) => {
  const { token, activities, sop, declarationAccepted, type } = req.body;

  if (!declarationAccepted)
    return res.status(400).json({ message: "Declaration required" });

  const tokenDoc = await ApplicationToken.findOne({
    student: req.user.userId,
    token
  });

  if (!tokenDoc)
    return res.status(401).json({ message: "Invalid token" });

  if (tokenDoc.expiresAt < new Date()) {
    await ApplicationToken.deleteOne({ _id: tokenDoc._id });
    return res.status(401).json({ message: "Token expired" });
  }

  const student = await Student.findById(req.user.userId);
  if (!student)
    return res.status(404).json({ message: "Student not found" });

  let updatedStudent;

  try {
    const payload = {
      rollNumbers: [student.rollno],
      portalKey: process.env.ERP_IDENTITY_SECRET,
    };

    const encryptedData = encryptValue(JSON.stringify(payload));
    const response = await axios.post(
      process.env.ERP_SERVER,
      encryptedData
    );

    const decryptedData = decryptValue(response.data.data);
    const erpData = JSON.parse(decryptedData)[0];

    updatedStudent = {
      cgpa: Number(erpData.cgpa),
      activeBacklog: erpData.active_backlogs === "true",
      backlogHistory: erpData.backlogs_history === "true",
    };

  } catch (err) {
    console.error("ERP validation failed:", err);
    updatedStudent = {
      cgpa: student.cgpa,
      activeBacklog: student.activeBacklog,
      backlogHistory: student.backlogHistory,
    };
  }

  // Final Eligibility Check
  if (
    updatedStudent.cgpa < 7 ||
    updatedStudent.activeBacklog ||
    updatedStudent.backlogHistory
  ) {
    return res.status(403).json({ message: "Not eligible" });
  }

  // Prevent duplicate application
  const existing = await RepresentativeApplication.findOne({
    student: student._id,
    type
  });

  if (existing)
    return res.status(400).json({ message: "Already applied" });

  await RepresentativeApplication.create({
    student: student._id,
    type,
    batch: student.batch,
    branch: student.branch,
    course: student.course,
    activities,
    sop,
    declarationAccepted
  });

  await ApplicationToken.deleteOne({ _id: tokenDoc._id });

  res.json({ message: "Application submitted successfully" });
};

export const downloadPDF = async (req, res) => {
  const application = await RepresentativeApplication
    .findById(req.params.id)
    .populate("student");

  if (!application)
    return res.status(404).json({ message: "Not found" });

  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${application.student.rollNumber}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(16).text("Training & Placement Centre", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(
    "Application Form for Internship/Placement Representative",
    { align: "center" }
  );

  doc.moveDown();
  doc.fontSize(12).text(`Name: ${application.student.name}`);
  doc.text(`Roll: ${application.student.rollNumber}`);
  doc.text(`Department: ${application.student.branch}`);
  doc.text(`CGPA: ${application.student.cgpa}`);

  doc.moveDown();
  doc.text("Activities:");
  application.activities.forEach((a, i) => {
    doc.text(`${i + 1}. ${a.description} | ${a.role} | ${a.duration}`);
  });

  doc.moveDown();
  doc.text("Statement of Purpose:");
  doc.text(application.sop);

  doc.moveDown();
  doc.text("Declaration: Accepted");

  doc.end();
};

export const getApplications = async (req, res) => {
  const { batch, branch, course, type } = req.query;

  const filter = {};
  if (batch) filter.batch = batch;
  if (branch) filter.branch = branch;
  if (course) filter.course = course;
  if (type) filter.type = type;

  const applications = await RepresentativeApplication
    .find(filter)
    .populate("student");

  res.json(applications);
};

export const exportExcel = async (req, res) => {
  const { batch } = req.query;

  const applications = await RepresentativeApplication
    .find({ batch })
    .populate("student");

  const workbook = new ExcelJS.Workbook();

  const branches = [...new Set(applications.map(a => a.branch))];

  for (const branch of branches) {
    const sheet = workbook.addWorksheet(branch);

    sheet.columns = [
      { header: "Name", key: "name" },
      { header: "Roll", key: "roll" },
      { header: "CGPA", key: "cgpa" },
      { header: "Type", key: "type" }
    ];

    applications
      .filter(a => a.branch === branch)
      .forEach(app => {
        sheet.addRow({
          name: app.student.name,
          roll: app.student.rollNumber,
          cgpa: app.student.cgpa,
          type: app.type
        });
      });
  }

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=applications.xlsx"
  );

  await workbook.xlsx.write(res);
  res.end();
};