import crypto from "crypto";
import ExcelJS from "exceljs";
import path from "path";
import ApplicationDeadline from "../models/applicationdeadline.js";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";

import Student from "../models/user_model/student.js";
import ApplicationToken from "../models/ir_pr_application_token.js";
import RepresentativeApplication from "../models/ir_pr_application.js";

import axios from "axios";
import { encryptValue, decryptValue } from "../utils/security.js";
// POST /api/representative/set-deadline
export const setDeadline = async (req, res) => {
  const { type, deadline } = req.body;

  const doc = await ApplicationDeadline.findOneAndUpdate(
    { type },
    { deadline },
    { upsert: true, new: true }
  );

  // console.log(`Deadline for ${type} set to:`, doc.deadline);
  res.json({
    message: "Deadline updated",
    deadline: doc.deadline
  });
};

export const getDeadline = async (req, res) => {
  const { type } = req.query;

  const doc = await ApplicationDeadline.findOne({ type });
  res.json({
    deadline: doc?.deadline || null
  });
};
export const generateToken = async (req, res) => {

  const student = await Student.findById(req.user.userId);

  if (!student)
    return res.status(404).json({ message: "Student not found" });

  const updatedStudent = student.toObject();

  // ⭐ Eligibility
const activeBacklogs = Number(updatedStudent.active_backlogs || 0);
const backlogHistory = Boolean(updatedStudent.backlogs_history);

if (
  updatedStudent.cgpa < 7 ||
  activeBacklogs > 0 ||
  backlogHistory
) {
  return res.status(403).json({ message: "Not eligible" });
}

  // ⭐ Type
  let type = null;
  if (updatedStudent.batch === "2028") type = "Internship";
  if (updatedStudent.batch === "2027") type = "Placement";

  if (!type)
    return res.status(400).json({ message: "Invalid batch" });


  // ⭐ Existing application
  const application = await RepresentativeApplication
    .findOne({ student: student._id, type })
    .populate("student");


  // ⭐ Token handling
  await ApplicationToken.deleteMany({ student: student._id });

  const token = crypto.randomBytes(32).toString("hex");

  await ApplicationToken.create({
    student: student._id,
    token,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });


  // ⭐ Deadline
  const deadlineDoc = await ApplicationDeadline.findOne({ type });

  // ⭐ Send ALL useful info
  res.json({
    token,
    type,
    application,
    deadline: deadlineDoc?.deadline || null,
    alreadySubmitted: application?.status === "submitted",
    message: application
      ? "Existing application loaded"
      : "Token generated"
  });
};


export const submitApplication = async (req, res) => {

  const {
    token,
   semester,
    declarationAccepted,
    type,

  } = req.body;
  const deadlineDoc = await ApplicationDeadline.findOne({ type });

if (
  deadlineDoc &&
  new Date() > new Date(deadlineDoc.deadline)
) {
  return res.status(403).json({
    message: "Deadline has passed. Submission closed."
  });
}
console.log(req.body.isFinalSubmit, typeof req.body.isFinalSubmit);
const isFinalSubmit= req.body.isFinalSubmit === "true" || req.body.isFinalSubmit === true;
  const studentId = req.user.userId;
const activities = JSON.parse(req.body.activities); 
  const student = await Student.findById(studentId);
  if (!student)
    return res.status(404).json({ message: "Student not found" });

  /* =====================================================
     FIND EXISTING APPLICATION (DRAFT OR SUBMITTED)
  ===================================================== */
  const sop = req.file
    ? req.file.path.replace(/\\/g, "/")
    : null;

  let application = await RepresentativeApplication.findOne({
    student: studentId,
    type
  });

  /* =====================================================
     💾 SAVE DRAFT (NO STRICT VALIDATION)
  ===================================================== */

  if (!isFinalSubmit) {

    application = await RepresentativeApplication.findOneAndUpdate(
      { student: studentId, type },
      {
        student: studentId,
        type,
        batch: student.batch,
        branch: student.branch,
        course: student.course,
        semester,
        activities,
        sop: sop || application?.sop,
        declarationAccepted,
        status: "draft"
      },
      { new: true, upsert: true }
    );
    return res.json({
      message: "Draft saved successfully",
      applicationId: application._id
    });
  }

  /* =====================================================
     📤 FINAL SUBMISSION STARTS HERE
  ===================================================== */

  if (!declarationAccepted)
    return res.status(400).json({ message: "Declaration required" });

  /* ---------- TOKEN VALIDATION ---------- */

  const tokenDoc = await ApplicationToken.findOne({
    student: studentId,
    token
  });

  if (!tokenDoc)
    return res.status(401).json({ message: "Invalid token" });

  if (tokenDoc.expiresAt < new Date()) {
    await ApplicationToken.deleteOne({ _id: tokenDoc._id });
    return res.status(401).json({ message: "Token expired" });
  }

  /* ---------- ERP ELIGIBILITY CHECK ---------- */

  let updatedStudent;

  try {

    // const payload = {
    //   rollNumbers: [student.rollno],
    //   portalKey: process.env.ERP_IDENTITY_SECRET,
    // };

    // const encryptedData = encryptValue(JSON.stringify(payload));

    // const response = await axios.post(
    //   process.env.ERP_SERVER,
    //   encryptedData
    // );

    // const decryptedData = decryptValue(response.data.data);
    // const erpData = JSON.parse(decryptedData)[0];
updatedStudent = {
  cgpa: student.cgpa,
  activeBacklog: student.active_backlogs,
  backlogHistory: student.backlogs_history,
};

  } catch (err) {

    console.error("ERP validation failed:", err);

   updatedStudent = {
  cgpa: student.cgpa,
  activeBacklog: student.active_backlogs,
  backlogHistory: student.backlogs_history,
};
  }

  /* ---------- FINAL ELIGIBILITY ---------- */
const activeBacklogs = Number(updatedStudent.activeBacklog || 0);
const backlogHistory = Boolean(updatedStudent.backlogHistory);

if (
  updatedStudent.cgpa < 7 ||
  activeBacklogs > 0 ||
  backlogHistory
) {
  return res.status(403).json({ message: "Not eligible" });
}
  /* ---------- PREVENT DOUBLE FINAL SUBMISSION ---------- */

  if (application && application.status === "submitted") {
return res.json({
  alreadySubmitted: true,
  message: "Already submitted",
  applicationId: application._id,
  sop: application.sop,
  submittedAt: application.submittedAt
});  }

  /* ---------- CREATE OR UPDATE AS FINAL ---------- */

  application = await RepresentativeApplication.findOneAndUpdate(
    { student: studentId, type },
    {
      student: studentId,
      type,
      batch: student.batch,
      branch: student.branch,
      course: student.course,
      semester,
      activities,
      sop: sop || application?.sop,
      declarationAccepted,
      status: "submitted",
      submittedAt: new Date()
    },
    { new: true, upsert: true }
  );

  /* ---------- DELETE TOKEN AFTER FINAL SUBMIT ---------- */

  await ApplicationToken.deleteOne({ _id: tokenDoc._id });

  res.json({
    message: "Application submitted successfully",
    applicationId: application._id
  });
};
export const deleteApplication = async (req, res) => {
  const { type } = req.body;
  const studentId = req.user.userId;

  const application = await RepresentativeApplication.findOneAndDelete({
    student: studentId,
    type
  });

  if (!application)
    return res.status(404).json({ message: "No application found" });

  res.json({ message: "Application deleted successfully" });
};
export const downloadPDF = async (req, res) => {
 
  try {
    const application = await RepresentativeApplication.findById(req.params.id).populate("student");
    if (!application) return res.status(404).json({ message: "Not found" });
// console.log("Generating PDF for application:", application);
    const templatePath = path.join(process.cwd(), "templates/ir_pr_form.pdf");
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    

    const font = await pdfDoc.embedFont("Helvetica-Bold"); 

    /* =====================================================
    ===================================================== */
    const page1 = pdfDoc.getPage(0);
    const labelX = 260; 
  
    let currentY = 512; 
    const gap = 20;    

    const personalFields = [
      application.student.name,
      application.student.rollno,
      application.student.department,
      application.student.course, 
      application.semester,
      application.student.phone,
      application.student.email
    ];

    personalFields.forEach((text,index) => {
       const xPos = index === 2   
    ? labelX - 40            
    : labelX;

      page1.drawText(String(text || ""), { 
        x:  xPos,
        y: currentY, 
        size: 12, // 12px font
        font 
      });
      currentY -= gap;
    });


    let academicY = 331; 
    page1.drawText(String(application.student.cgpa || ""), { x: labelX+70, y: academicY, size: 12, font });
    page1.drawText(application.student.active_backlogs ? "Yes" : "No", { x: labelX+135, y: academicY - 20, size: 12, font });
    page1.drawText(application.student. backlogs_history ? "Yes" : "No", { x: labelX+200, y: academicY - 40, size: 12, font });


const acts = application.activities || [];

const startY = 220;   // first row
const gap2 = 17;       // row spacing
const size = 11;

acts.slice(0, 6).forEach((a, i) => {
  const y = startY - i * gap2;

  page1.drawText(String(i + 1),           { x: 64,  y, size, font }); // S.No.
  page1.drawText(a.description || "",     { x: 100, y, size, font }); // Description
  page1.drawText(a.role || "",            { x: 385, y, size, font }); // Role
  page1.drawText(a.duration || "",        { x: 485, y, size, font }); // Duration
});
    
    const page2 = pdfDoc.getPage(1);
    
 
    page2.drawText(application.student.name || "", { 
      x: 105, 
      y: 568, 
      size: 12, 
      font 
    });

    // For Office Use Only section is left blank 
//sop is added
    if (application.sop && fs.existsSync(application.sop)) {
        const sopBytes = fs.readFileSync(application.sop);
        const sopPdf = await PDFDocument.load(sopBytes);
        const sopPages = await pdfDoc.copyPages(sopPdf, sopPdf.getPageIndices());
        sopPages.forEach(p => pdfDoc.addPage(p));
    }

    const finalPdf = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=IRPR_${application.student.rollno}.pdf`);
    res.send(Buffer.from(finalPdf));

  } catch (err) {
    console.error("PDF Generation Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getApplications = async (req, res) => {
  const { batch, branch, course, type } = req.query;
// console.log("Query params:", req.query);
  const filter = {status: "submitted"};
  if (batch) filter.batch = batch;
  if (branch) filter.branch = branch;
  if (course) filter.course = course;
  if (type) filter.type = type;

  const applications = await RepresentativeApplication
    .find(filter)
    .populate("student");
// console.log("Fetched applications:", applications);
  res.json(applications);
};
export const exportExcel = async (req, res) => {
  try {
    const { batch, branch, course, type } = req.query;

    const filter = { status: "submitted" };
    if (batch) filter.batch = batch;
    if (branch) filter.branch = branch;
    if (course) filter.course = course;
    if (type) filter.type = type;

    const applications = await RepresentativeApplication
      .find(filter)
      .populate("student");

    if (!applications.length) {
      return res.status(404).json({ message: "No applications found" });
    }

    const workbook = new ExcelJS.Workbook();

    // 🌐 Base URL auto (no hardcode)
    const BASE_URL = `${req.protocol}://${req.get("host")}`;

    // ⭐ Get unique departments (branches)
    const departments = [
      ...new Set(applications.map(a => a.branch || "Other"))
    ];

    for (const dept of departments) {

      // Excel sheet name rules (<= 31 chars, no special chars)
      const sheetName = dept
        .substring(0, 31)
        .replace(/[\\/*?:[\]]/g, "");

      const sheet = workbook.addWorksheet(sheetName);

      // Columns
      sheet.columns = [
        { header: "Name", key: "name", width: 25 },
        { header: "Roll", key: "roll", width: 18 },
        { header: "CGPA", key: "cgpa", width: 10 },
        { header: "Semester", key: "sem", width: 10 },
        { header: "Type", key: "type", width: 15 },
        { header: "PDF", key: "pdf", width: 40 }
      ];

      // Add rows for this department only
      applications
        .filter(a => (a.branch || "Other") === dept)
        .forEach(app => {
          sheet.addRow({
            name: app.student?.name || "",
            roll: app.student?.rollNumber || "",
            cgpa: app.student?.cgpa || "",
            sem: app.semester || "",
            type: app.type || "",
            pdf: {
              text: "Download PDF",
              hyperlink: `${BASE_URL}/api/representative/pdf/${app._id}`
            }
          });
        });
    }

    // Response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=department_wise_applications.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Export Excel Error:", err);
    res.status(500).json({ message: "Export failed" });
  }
};
// export const exportExcel = async (req, res) => {

//   const BASE_URL = `${req.protocol}://${req.get("host")}`;
//   try {
//     const { batch, course, branch, type } = req.query;

//     const filter = {};

//     if (batch) filter.batch = batch;
//     if (course && course !== "All") filter.course = course;
//     if (branch) filter.branch = branch;
//     if (type) filter.type = type;

//     const applications = await RepresentativeApplication
//       .find(filter)
//       .populate("student");

//     if (!applications.length) {
//       return res.status(404).json({ message: "No applications found" });
//     }

//     const workbook = new ExcelJS.Workbook();

//     // Get unique branches
//     const branches = [
//       ...new Set(applications.map(a => a.branch || "Other"))
//     ];

//     for (const br of branches) {

//       // Excel sheet name must be <= 31 chars
//       const sheetName = br.substring(0, 31).replace(/[\\/*?:[\]]/g, "");

//       const sheet = workbook.addWorksheet(sheetName);

//       sheet.columns = [
//         { header: "Name", key: "name", width: 25 },
//         { header: "Roll", key: "roll", width: 18 },
//         { header: "CGPA", key: "cgpa", width: 10 },
//         { header: "Branch", key: "branch", width: 30 },
//         { header: "Semester", key: "semester", width: 15 },
//         { header: "Type", key: "type", width: 15 },
//         { header: "Document", key: "document", width: 15 }
//       ];

//       applications
//         .filter(a => (a.branch || "Other") === br)
//         .forEach(app => {
//           sheet.addRow({
//             name: app.student?.name || "",
//             roll: app.student?.rollno || "",
//             cgpa: app.student?.cgpa || "",
//             branch: app.student?.department || "",
//             semester: app.semester || "",
//             type: app.type || "",
//            document: {
//   text: "View PDF",
//   hyperlink: `${BASE_URL}/api/representative/pdf/${app._id}`
// }
//           });
//         });
//     }

//     // Response headers
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );

//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=representative_applications.xlsx"
//     );

//     await workbook.xlsx.write(res);
//     res.end();

//   } catch (err) {
//     console.error("Export Excel Error:", err);
//     res.status(500).json({ message: "Failed to export Excel" });
//   }
// };