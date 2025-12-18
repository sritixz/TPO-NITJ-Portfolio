import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import fs from 'fs';
import InternshipApplication from '../../models/outsource-internship/lte2month.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RELATIVE_BASE = 'uploads/outsource-internships/lte2month';

const getFullPath = (relativePath) => path.join(process.cwd(), relativePath);

const getRelativePath = (fieldname, filename) => `${RELATIVE_BASE}/${fieldname}/${filename}`;

/* =====================================================
   MULTER CONFIGURATION
===================================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subdir = file.fieldname; // 'photo', 'signature', 'documents', or 'pdf'
    const uploadDir = path.join(process.cwd(), 'uploads/outsource-internships/lte2month', subdir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'photo' || file.fieldname === 'signature') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  } else if (file.fieldname === 'documents' || file.fieldname === 'pdf') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'), false);
    }
  } else {
    cb(new Error('Invalid file field'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

/* =====================================================
   NODEMAILER CONFIG
===================================================== */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =====================================================
   CREATE INTERNSHIP (LOCKED = FALSE)
===================================================== */
export const createInternship = [
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'documents', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const applicantId = req.user.userId;
      const {
        departmentAppliedFor,
        proposedFacultyMember,
        proposedFacultyMemberEmail,
        proposedFacultyMemberContact,
        name,
        institution,
        presentSemester,
        branch,
        course,
        postalAddress,
        permanentAddress,
        mobileNo,
        email,
        fathersName,
        gender,
        dateOfBirth,
        nationality,
        educationQualifications,
        overallCGPA,
        declarationAccepted
      } = req.body;
      // FIXED: Type-safe parsing to avoid throw on non-string (e.g., if parsed as object)
      const quals = (educationQualifications && typeof educationQualifications === 'string')
        ? JSON.parse(educationQualifications)
        : (Array.isArray(educationQualifications) ? educationQualifications : []);
      const newApplication = new InternshipApplication({
        applicantId,
        departmentAppliedFor,
        proposedFacultyMember,
        proposedFacultyMemberEmail,
        proposedFacultyMemberContact,
        name: name?.toUpperCase(),
        institution,
        presentSemester,
        branch: branch?.toUpperCase(),
        course: course?.toUpperCase(),
        postalAddress,
        permanentAddress,
        mobileNo,
        email: email?.toLowerCase(),
        fathersName: fathersName?.toUpperCase(),
        gender,
        dateOfBirth: new Date(dateOfBirth),
        nationality: nationality?.toUpperCase(),
        educationQualifications: quals,
        overallCGPA,
        declarationAccepted: declarationAccepted === 'true',
        photo: req.files?.photo?.[0] ? getRelativePath('photo', req.files.photo[0].filename) : null,
        signature: req.files?.signature?.[0] ? getRelativePath('signature', req.files.signature[0].filename) : null,
        documents: req.files?.documents?.[0] ? getRelativePath('documents', req.files.documents[0].filename) : null,
        locked: false
      });
      const savedApplication = await newApplication.save();
      res.status(201).json(savedApplication);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
];

/* =====================================================
   UPDATE INTERNSHIP (IF NOT LOCKED)
===================================================== */
export const updateInternship = [
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'documents', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const applicantId = req.user.userId;
      const { id } = req.params;
      const application = await InternshipApplication.findById(id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      if(!application.applicantId.equals(applicantId)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      if (application.locked) {
        return res.status(403).json({ message: 'Application is locked' });
      }
      const {
        departmentAppliedFor,
        proposedFacultyMember,
        proposedFacultyMemberEmail,
        proposedFacultyMemberContact,
        name,
        institution,
        presentSemester,
        branch,
        course,
        postalAddress,
        permanentAddress,
        mobileNo,
        email,
        fathersName,
        gender,
        dateOfBirth,
        nationality,
        educationQualifications,
        overallCGPA,
        declarationAccepted
      } = req.body;
      const quals = (educationQualifications && typeof educationQualifications === 'string')
        ? JSON.parse(educationQualifications)
        : (Array.isArray(educationQualifications) ? educationQualifications : []);
      const updates = {
        applicantId,
        departmentAppliedFor,
        proposedFacultyMember,
        proposedFacultyMemberEmail,
        proposedFacultyMemberContact,
        name: name?.toUpperCase(),
        institution,
        presentSemester,
        branch: branch?.toUpperCase(),
        course: course?.toUpperCase(),
        postalAddress,
        permanentAddress,
        mobileNo,
        email: email?.toLowerCase(),
        fathersName: fathersName?.toUpperCase(),
        gender,
        dateOfBirth: new Date(dateOfBirth),
        nationality: nationality?.toUpperCase(),
        educationQualifications: quals,
        overallCGPA,
        declarationAccepted: declarationAccepted === 'true'
      };
      // FIXED: Handle optional file updates with deletion of old files
      if (req.files?.photo?.[0]) {
        if (application.photo) {
          try {
            fs.unlinkSync(getFullPath(application.photo));
          } catch (unlinkErr) {
            console.error('Error deleting old photo:', unlinkErr);
          }
        }
        updates.photo = getRelativePath('photo', req.files.photo[0].filename);
      }
      if (req.files?.signature?.[0]) {
        if (application.signature) {
          try {
            fs.unlinkSync(getFullPath(application.signature));
          } catch (unlinkErr) {
            console.error('Error deleting old signature:', unlinkErr);
          }
        }
        updates.signature = getRelativePath('signature', req.files.signature[0].filename);
      }
      if (req.files?.documents?.[0]) {
        if (application.documents) {
          try {
            fs.unlinkSync(getFullPath(application.documents));
          } catch (unlinkErr) {
            console.error('Error deleting old document:', unlinkErr);
          }
        }
        updates.documents = getRelativePath('documents', req.files.documents[0].filename);
      }
      Object.assign(application, updates);
      const updated = await application.save();
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
];

/* =====================================================
   LOCK APPLICATION + SEND MAIL
===================================================== */
export const lockInternshipApplication = [
  upload.single('pdf'),
  async (req, res) => {
    try {
      const applicantId = req.user.userId;
      const { id } = req.params;
      const application = await InternshipApplication.findById(id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      if(!application.applicantId.equals(applicantId)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      if (application.locked) {
        return res.status(400).json({ message: 'Application already locked' });
      }
      application.locked = true;
      await application.save();
      let emailSent = false;
      const attachments = [];
      if (application.documents) {
        attachments.push({
          filename: path.basename(application.documents),
          path: getFullPath(application.documents)
        });
      }
      if (req.file) {
        attachments.push({
          filename: req.file.originalname || `LTE2Month_Application_${application._id.slice(-6)}.pdf`,
          path: req.file.path
        });
      }
      // Email sending in isolated try-catch to not block lock
      try {
        const mailOptions = {
          from: `"CTP Portal" <${process.env.EMAIL_USER}>`,
          to: 'shivamp.cs.22@nitj.ac.in',
          subject: 'Summer / Winter Internship Application',
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2 style="text-align:center;">
                Summer / Winter Internship Application
              </h2>
              <hr />
              <h3>Student Details</h3>
              <p><b>Name:</b> ${application.name}</p>
              <p><b>Institution:</b> ${application.institution}</p>
              <p><b>Course:</b> ${application.course}</p>
              <p><b>Branch:</b> ${application.branch}</p>
              <p><b>Semester:</b> ${application.presentSemester}</p>
              <br />
              <h3>Proposed Faculty Details</h3>
              <p><b>Faculty Name:</b> ${application.proposedFacultyMember}</p>
              <p><b>Faculty Email:</b> ${application.proposedFacultyMemberEmail}</p>
              <p><b>Faculty Contact No:</b> ${application.proposedFacultyMemberContact}</p>
              <p><b>Department Applied For:</b> ${application.departmentAppliedFor}</p>
              <br />
              <p>This is an auto-generated mail from <b>CTP Portal</b>.</p>
            </div>
          `,
          attachments
        };
        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (emailError) {
        console.error('Failed to send lock notification email:', emailError);
        // Optionally: Log to a service like Sentry, or queue for retry
      } finally {
        // Always clean up temp PDF (even on email failure)
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkErr) {
            console.error('Error deleting temporary PDF:', unlinkErr);
          }
        }
      }
      const message = `Application locked successfully${emailSent ? ' and email sent' : ', but email notification failed (check logs)'}`;
      res.json({
        message,
        application
      });
    } catch (error) {
      // This catch is only for non-email errors (e.g., DB save)
      console.error('Lock operation failed:', error);
      res.status(500).json({ message: error.message });
    }
  }
];

/* =====================================================
   GET / UPDATE / DELETE 
===================================================== */
export const getAllInternships = async (req, res) => {
  try {
    const applicantId = req.user.userId;
    const applications = await InternshipApplication.find({ applicantId });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInternshipById = async (req, res) => {
  try {
    const applicantId = req.user.userId;
    const application = await InternshipApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if(!application.applicantId.equals(applicantId)) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInternship = async (req, res) => {
  try {
    const applicantId = req.user.userId;
    const application = await InternshipApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if(!application.applicantId.equals(applicantId)) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    if (application.locked) {
      return res.status(403).json({ message: 'Locked application cannot be deleted' });
    }
    // Delete associated files
    if (application.photo) {
      try {
        fs.unlinkSync(getFullPath(application.photo));
      } catch (unlinkErr) {
        console.error('Error deleting photo:', unlinkErr);
      }
    }
    if (application.signature) {
      try {
        fs.unlinkSync(getFullPath(application.signature));
      } catch (unlinkErr) {
        console.error('Error deleting signature:', unlinkErr);
      }
    }
    if (application.documents) {
      try {
        fs.unlinkSync(getFullPath(application.documents));
      } catch (unlinkErr) {
        console.error('Error deleting document:', unlinkErr);
      }
    }
    await application.deleteOne();
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};