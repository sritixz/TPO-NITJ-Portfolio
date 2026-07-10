import JobAnnouncementForm from "../models/jaf.js";
import Recuiter from "../models/user_model/recuiter.js"; 
import crypto from "crypto";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Secure helper to generate an 8-10 character random alphanumeric password
const generateRandomPassword = () => {
  const length = Math.floor(Math.random() * 3) + 8; // Generates length 8, 9, or 10
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

// 1. Public endpoint logic for external company links (Official Large Format Sync)
export const createPublicJobAnnouncementForm = async (req, res) => {
  try {
    const {
      organizationName,
      websiteUrl,
      category, 
      sector,
      placementType,
      bTechPrograms,
      mTechPrograms,
      mbaProgramSpecializations,
      scienceStreamsSpecializations,
      phdPrograms,
      requiredSkills,
      designations,
      jobLocation,
      specificLocations,
      bond,
      selectionProcess,
      additionalSelectionDetails,
      summerInternshipOpportunities,
      hrContacts,
      postalAddress,
    } = req.body;

    const primaryHrEmail = (hrContacts?.[0]?.email || "").toLowerCase().trim();

    if (!primaryHrEmail) {
      return res.status(400).json({
        message: "At least one HR contact with a valid email is required.",
      });
    }

    // 🔒 Require a valid jafEmailVerified cookie (set by controller/otp.js
    // verifyOtp) whose email matches the primary HR contact on this form.
    const cookieToken = req.cookies?.jafEmailVerified;

    if (!cookieToken) {
      return res.status(403).json({
        message: "Please verify the primary HR contact's email with OTP before submitting.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(cookieToken, process.env.JWT_SECRET);
    } catch (err) {
      res.clearCookie("jafEmailVerified");
      return res.status(403).json({
        message: "Email verification has expired. Please verify your email again.",
      });
    }

    if (decoded.purpose !== "jaf-email-verification" || decoded.email !== primaryHrEmail) {
      return res.status(403).json({
        message: "Email verification does not match the primary HR contact. Please verify again.",
      });
    }
    
    const newJobAnnouncement = new JobAnnouncementForm({
      recruiterId: null, // Public submissions are unlinked until TPO Admin approves
      organizationName,
      websiteUrl,
      category, 
      sector,
      placementType,
      bTechPrograms,
      mTechPrograms,
      mbaProgramSpecializations,
      scienceStreamsSpecializations,
      phdPrograms,
      requiredSkills,
      designations, // Stores full array: [{ title, stipend, ctc }]
      jobLocation,
      specificLocations,
      bond,
      selectionProcess,
      additionalSelectionDetails,
      summerInternshipOpportunities,
      hrContacts, // Stores full array: [{ name, designation, email, phone }]
      postalAddress,
      approved_status: false // Always defaults to false for verification loop on pdash
    });

    const savedJobAnnouncement = await newJobAnnouncement.save();

    // Single-use: clear the cookie so it can't be replayed for another submit
    res.clearCookie("jafEmailVerified");

    return res.status(201).json({
      message: 'Job Announcement Form submitted successfully and is pending approval.',
      data: savedJobAnnouncement
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Error submitting public Job Announcement Form',
      error: error.message
    });
  }
};

// 2. Authenticated create method (For recruiters logged into rdashboard)
export const createJobAnnouncementForm = async (req, res) => {
  try {
    const recruiterId = req.user?.userId || req.user?._id;
    const {
      organizationName,
      websiteUrl,
      category, 
      sector,
      placementType,
      bTechPrograms,
      mTechPrograms,
      mbaProgramSpecializations,
      scienceStreamsSpecializations,
      phdPrograms,
      requiredSkills,
      designations,
      jobLocation,
      specificLocations,
      bond,
      selectionProcess,
      additionalSelectionDetails,
      summerInternshipOpportunities,
      hrContacts,
      postalAddress,
      approved_status
    } = req.body;
    
    const newJobAnnouncement = new JobAnnouncementForm({
      recruiterId,
      organizationName,
      websiteUrl,
      category, 
      sector,
      placementType,
      bTechPrograms,
      mTechPrograms,
      mbaProgramSpecializations,
      scienceStreamsSpecializations,
      phdPrograms,
      requiredSkills,
      designations,
      jobLocation,
      specificLocations,
      bond,
      selectionProcess,
      additionalSelectionDetails,
      summerInternshipOpportunities,
      hrContacts,
      postalAddress,
      approved_status: approved_status || false,
    });

    const savedJobAnnouncement = await newJobAnnouncement.save();
    return res.status(201).json({
      message: 'Job Announcement Form created successfully',
      data: savedJobAnnouncement
    });
  } catch (error) {
<<<<<<< HEAD
    return res.status(400).json({
=======
 
    res.status(400).json({
>>>>>>> 95a9aacb050b56a2207ab2e65cacc9af1e91bbc2
      message: 'Error creating Job Announcement Form',
      error: error.message
    });
  }
};

// 3. Role-aware data fetching for both dashboards
export const getjaf = async (req, res) => {
  try {
<<<<<<< HEAD
    const targetUserId = req.user?.userId || req.user?._id;
    const targetRole = req.user?.userType || req.user?.role;

    if (targetRole === "Recuiter" || targetRole === "Recruiter") {
      const queryConditions = [{ recruiterId: targetUserId }];

      if (mongoose.Types.ObjectId.isValid(targetUserId)) {
        queryConditions.push({ recruiterId: new mongoose.Types.ObjectId(targetUserId) });
      }

      const recruiterJAFs = await JobAnnouncementForm.find({ $or: queryConditions });
      
      return res.status(200).json({
        approved: recruiterJAFs.filter(jaf => jaf.approved_status === true) || [],
        notApproved: recruiterJAFs.filter(jaf => jaf.approved_status === false) || []
      });
    }

    // Faculty Dashboard/Admin fallback
    const approved_jaf = await JobAnnouncementForm.find({ approved_status: true });
    const notApproved_jaf = await JobAnnouncementForm.find({ approved_status: false });
    
    return res.status(200).json({ 
      approved: approved_jaf || [], 
      notApproved: notApproved_jaf || [] 
    });

  } catch(error){
    return res.status(400).json({ message: 'Error fetching Job Announcement Form', error: error.message });
=======
 
    const { _id } = req.params;
 
    const approvedJAF = await JobAnnouncementForm.findByIdAndUpdate(
      _id,
      { approved_status: true },
      { new: true }
    );
    if (!approvedJAF) return res.status(404).json({ message: "JAF not found" });
    res.status(200).json({ message: "JAF approved successfully", approvedJAF });
  } catch (err) {
    res.status(500).json({ error: err.message });
>>>>>>> 95a9aacb050b56a2207ab2e65cacc9af1e91bbc2
  }
};

// 4. Automated account registration & mailer execution
export const approveJAF = async (req, res) => {
  try {
    // 🛠️ FIX: Flexible extraction to catch both dynamic variable standards cleanly
    const jafId = req.params._id || req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jafId)) {
      return res.status(400).json({ message: "Invalid JAF database object identity specification format." });
    }

    const jaf = await JobAnnouncementForm.findById(jafId);
    if (!jaf) return res.status(404).json({ message: "JAF not found" });

    const primaryHR = jaf.hrContacts && jaf.hrContacts[0];
    if (!primaryHR || !primaryHR.email) {
      return res.status(400).json({ 
        message: "Cannot approve JAF: Form must contain at least one valid HR contact email." 
      });
    }

    const hrEmail = primaryHR.email.toLowerCase().trim();
    let recruiter = await Recuiter.findOne({ email: hrEmail });
    let generatedPassword = "";

    if (!recruiter) {
      generatedPassword = generateRandomPassword();

      const newRecruiterData = {
        name: primaryHR.name || "HR Manager",
        email: hrEmail,
        password: generatedPassword, 
        company: jaf.organizationName,
        designation: primaryHR.designation || "HR Specialist",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await mongoose.connection.db.collection('recuiters').insertOne(newRecruiterData);
      recruiter = { _id: result.insertedId };
    } else {
      generatedPassword = "[Use your existing registered dashboard password]";
    }

    const approvedJAF = await JobAnnouncementForm.findByIdAndUpdate(
      jafId,
      { 
        approved_status: true,
        recruiterId: recruiter._id
      },
      { new: true }
    );

    const frontendUrl = process.env.CLIENT_URL;
    const loginLink = `https://ctp.nitj.ac.in/login`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: hrEmail,
      subject: `Job Announcement Approved - ${jaf.organizationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0369A0; padding: 16px; text-align: center; color: #ffffff;">
              <h2 style="margin: 0; font-size: 20px;">Campus Recruitment</h2>
            </div>
            <div style="padding: 24px; background-color: #fafafa;">
              <p style="font-size: 16px;">Dear <strong>${primaryHR.name || "HR Partner"}</strong>,</p>
              <p style="font-size: 15px;">
                Thank you for submitting your Job Announcement Form (JAF) for <strong>${jaf.organizationName}</strong>. Your profile has been reviewed and approved by the Training & Placement Office.
              </p>
              <p style="font-size: 15px;">
                You can now log in to the portal using the corporate credentials generated below to track application submissions and manage upcoming recruitment batches.
              </p>
              
              <div style="background-color: #f0f7ff; border-left: 4px solid #0369A0; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 4px 0;"><strong>Portal URL:</strong> <a href="${loginLink}" style="color: #0369A0; text-decoration: none; font-weight: bold;">Access Dashboard Here</a></p>
                <p style="margin: 4px 0;"><strong>Registered Email:</strong> ${hrEmail}</p>
                <p style="margin: 4px 0;"><strong>Temporary Password:</strong> <code style="background: #e1e8ed; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${generatedPassword}</code></p>
              </div>
            </div>
            <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 13px; color: #777;">
              <p style="margin: 0;">Best regards,</p>
              <p style="margin: 0; font-weight: bold; color: #0369A0;">TPO Dev Team</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "JAF approved successfully", approvedJAF });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 5. Deletion/Rejection logic
export const rejectJAF = async (req, res) => {
  try {
    const jafId = req.params._id || req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jafId)) {
      return res.status(400).json({ message: "Invalid JAF ID format layout reference." });
    }

    const deletedJAF = await JobAnnouncementForm.findByIdAndDelete(jafId);

    if (!deletedJAF) {
      return res.status(404).json({ message: "JAF not found" });
    }

    return res.status(200).json({ message: "JAF application deleted successfully", deletedJAF });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 6. Update controller parameters
export const updateJAF = async (req, res) => {
  try {
    const jafId = req.params._id || req.params.id;
    const jaf = await JobAnnouncementForm.findById(jafId);
    if (!jaf) {
      return res.status(404).json({ success: false, message: 'JAF not found' });
    }
    const updatedJAF = await JobAnnouncementForm.findByIdAndUpdate(jafId, req.body, { new: true });
    return res.status(200).json({ success: true, message: 'JAF updated successfully', jaf: updatedJAF });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};