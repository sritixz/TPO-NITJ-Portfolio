import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import fs from 'fs';
import LongTermInternshipApplication from '../../models/outsource-internship/gte3month.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RELATIVE_BASE = 'uploads/outsource-internships/gte3month';

const getFullPath = (relativePath) => path.join(process.cwd(), relativePath);

const getRelativePath = (fieldname, filename) => `${RELATIVE_BASE}/${fieldname}/${filename}`;

/* =====================================================
   MULTER CONFIGURATION
===================================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subdir = file.fieldname; // 'photo', 'signature', 'documents', or 'pdf'
    const uploadDir = path.join(process.cwd(), 'uploads/outsource-internships/gte3month', subdir);
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
export const createLongTermInternship = [
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'documents', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const applicantId = req.user.userId;
      const {
        homeUniversityName,
        homeUniversityAddress,
        durationFrom,
        durationTo,
        nonDegreeActivities,
        internshipType,
        ApplicantName,
        fathersName,
        mothersName,
        dateOfBirth,
        birthCity,
        birthCountry,
        maritalStatus,
        nationality,
        passportNo,
        passportIssueDate,
        passportIssuePlace,
        passportValidUpTo,
        correspondenceAddress,
        phone,
        altphone,
        email,
        hostelNeeded,
        facultySupervisor,
        facultySupervisorDepartment,
        universityTel,
        universityFax,
        universityEmail,
        department,
        degree,
        academicYear,
        academicSemester,
        declarationAccepted,
        languagesKnown,
        specialInterestsHobbies,
        contactsInIndia
      } = req.body;

      const langs = (languagesKnown && typeof languagesKnown === 'string')
        ? JSON.parse(languagesKnown)
        : (Array.isArray(languagesKnown) ? languagesKnown : []);

      const newApplication = new LongTermInternshipApplication({
        applicantId,
        homeUniversityName,
        homeUniversityAddress,
        durationFrom: new Date(durationFrom),
        durationTo: new Date(durationTo),
        nonDegreeActivities,
        internshipType,
        ApplicantName: ApplicantName?.toUpperCase(),
        fathersName: fathersName?.toUpperCase(),
        mothersName: mothersName?.toUpperCase(),
        dateOfBirth: new Date(dateOfBirth),
        birthCity,
        birthCountry,
        maritalStatus,
        nationality: nationality?.toUpperCase(),
        passportNo,
        passportIssueDate: new Date(passportIssueDate),
        passportIssuePlace,
        passportValidUpTo: new Date(passportValidUpTo),
        correspondenceAddress,
        phone,
        altphone,
        email: email?.toLowerCase(),
        hostelNeeded: hostelNeeded === 'true',
        facultySupervisor,
        facultySupervisorDepartment,
        universityTel,
        universityFax,
        universityEmail: universityEmail?.toLowerCase(),
        department,
        degree,
        academicYear,
        academicSemester,
        declarationAccepted,
        languagesKnown: langs,
        specialInterestsHobbies,
        contactsInIndia,
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
export const updateLongTermInternship = [
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'documents', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const applicantId = req.user.userId;
      const { id } = req.params;
      const application = await LongTermInternshipApplication.findById(id);
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
        homeUniversityName,
        homeUniversityAddress,
        durationFrom,
        durationTo,
        nonDegreeActivities,
        internshipType,
        ApplicantName,
        fathersName,
        mothersName,
        dateOfBirth,
        birthCity,
        birthCountry,
        maritalStatus,
        nationality,
        passportNo,
        passportIssueDate,
        passportIssuePlace,
        passportValidUpTo,
        correspondenceAddress,
        phone,
        altphone,
        email,
        hostelNeeded,
        facultySupervisor,
        facultySupervisorDepartment,
        universityTel,
        universityFax,
        universityEmail,
        department,
        degree,
        academicYear,
        academicSemester,
        declarationAccepted,
        languagesKnown,
        specialInterestsHobbies,
        contactsInIndia
      } = req.body;

      const langs = (languagesKnown && typeof languagesKnown === 'string')
        ? JSON.parse(languagesKnown)
        : (Array.isArray(languagesKnown) ? languagesKnown : []);

      const updates = {
        applicantId,
        homeUniversityName,
        homeUniversityAddress,
        durationFrom: new Date(durationFrom),
        durationTo: new Date(durationTo),
        nonDegreeActivities,
        internshipType,
        ApplicantName: ApplicantName?.toUpperCase(),
        fathersName: fathersName?.toUpperCase(),
        mothersName: mothersName?.toUpperCase(),
        dateOfBirth: new Date(dateOfBirth),
        birthCity,
        birthCountry,
        maritalStatus,
        nationality: nationality?.toUpperCase(),
        passportNo,
        passportIssueDate: new Date(passportIssueDate),
        passportIssuePlace,
        passportValidUpTo: new Date(passportValidUpTo),
        correspondenceAddress,
        phone,
        altphone,
        email: email?.toLowerCase(),
        hostelNeeded: hostelNeeded === 'true',
        facultySupervisor,
        facultySupervisorDepartment,
        universityTel,
        universityFax,
        universityEmail: universityEmail?.toLowerCase(),
        department,
        degree,
        academicYear,
        academicSemester,
        declarationAccepted,
        languagesKnown: langs,
        specialInterestsHobbies,
        contactsInIndia
      };

      // Handle optional file updates with deletion of old files
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
export const lockLongTermInternshipApplication = [
  upload.single('pdf'),
  async (req, res) => {
    try {
      const applicantId = req.user.userId;
      const { id } = req.params;
      const application = await LongTermInternshipApplication.findById(id);
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
          filename: req.file.originalname || `LTEMoreThan3Month_Application_${application._id.slice(-6)}.pdf`,
          path: req.file.path
        });
      }

      // Email sending in isolated try-catch to not block lock
      try {
        const mailOptions = {
          from: `"CTP Portal" <${process.env.EMAIL_USER}>`,
          to: 'shivamp.cs.22@nitj.ac.in',
          subject: 'Long Term Internship Application (>3 Months)',
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2 style="text-align:center;">
                Long Term Internship Application (>3 Months)
              </h2>
              <hr />
              <h3>Student Details</h3>
              <p><b>Applicant Name:</b> ${application.ApplicantName}</p>
              <p><b>Home University:</b> ${application.homeUniversityName}</p>
              <p><b>Home University Address:</b> ${application.homeUniversityAddress}</p>
              <p><b>Department:</b> ${application.department}</p>
              <p><b>Degree:</b> ${application.degree}</p>
              <p><b>Academic Year:</b> ${application.academicYear}</p>
              <p><b>Academic Semester:</b> ${application.academicSemester}</p>
              <p><b>Duration:</b> From ${application.durationFrom.toDateString()} to ${application.durationTo.toDateString()}</p>
              <p><b>Internship Type:</b> ${application.internshipType}</p>
              <br />
              <h3>Faculty Supervisor Details</h3>
              <p><b>Faculty Supervisor:</b> ${application.facultySupervisor}</p>
              <p><b>Faculty Supervisor Department:</b> ${application.facultySupervisorDepartment}</p>
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
export const getAllLongTermInternships = async (req, res) => {
  try {
    const applicantId = req.user.userId;
    const applications = await LongTermInternshipApplication.find({ applicantId });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLongTermInternshipById = async (req, res) => {
  try {
    const applicantId = req.user.userId;
    const application = await LongTermInternshipApplication.findById(req.params.id);
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

export const deleteLongTermInternship = async (req, res) => {
  try {
    const applicantId = req.user.userId;
    const application = await LongTermInternshipApplication.findById(req.params.id);
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

//pdashboard routes
export const getAllLongTermInternshipsProf = async (req, res) => {
  try {
    const applications = await LongTermInternshipApplication.find({});
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};