import FormSubmission from '../models/FormSubmission.js';
import JobProfile from '../models/jobprofile.js';
import JobEligibility from '../models/eligibility.js';
import Student from '../models/user_model/student.js';
import mongoose from 'mongoose';
import nodemailer from "nodemailer";
import Withdrawtoken from '../models/withdrawtoken.js';
import jwt from "jsonwebtoken";

// Fetch existing submission for a job and student
export const getSubmissionbystudent = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.userId;

    // Check if the student is eligible for the job
    const eligibility = await JobEligibility.findOne({ jobId, studentId });
    if (!eligibility || !eligibility.eligible) {
      return res.status(403).json({ message: 'You are not eligible to apply for this job' });
    }

    const submission = await FormSubmission.findOne({
      jobId: new mongoose.Types.ObjectId(jobId),
      studentId: new mongoose.Types.ObjectId(studentId),
    });
    res.status(200).json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch submission', error: err.message });
  }
};

export const submitForm = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
   
    const { jobId, fields, resumeUrl } = req.body;

    const existingSubmission = await FormSubmission.findOne({ jobId, studentId });
    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Check if the student is eligible for the job
    const eligibility = await JobEligibility.findOne({ jobId, studentId });
    if (!eligibility || !eligibility.eligible) {
      return res.status(403).json({ message: 'You are not eligible to apply for this job' });
    }

    const updatedFields = fields.map((field) => {
      if (field.isAutoFilled && field.studentPropertyPath) {
        let value;
        if (field.studentPropertyPath === 'cgpa %') {
          // Special case: multiply cgpa by 10 if it exists
          value = student['cgpa'] != null ? student['cgpa'] * 10 : '';
        } else {
          // Use the database value, default to empty string if null/undefined
          value = student[field.studentPropertyPath] ?? '';
        }
        return { ...field, value };
      }
      return field;
    });

    const formSubmission = new FormSubmission({
      jobId,
      studentId,
      fields: updatedFields,
      resumeUrl
    });
    await formSubmission.save();

    await JobProfile.findOneAndUpdate(
      { _id: jobId },
      { $addToSet: { Applied_Students: studentId } },
      { new: true }
    );

    await JobProfile.findOneAndUpdate(
      {
        _id: jobId,
        "Hiring_Workflow.0": { $exists: true },
      },
      {
        $addToSet: { "Hiring_Workflow.0.eligible_students": studentId },
      },
      { new: true }
    );

    res.status(201).json({ message: 'Form submitted successfully'});
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit form', error: err.message });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
 
    const studentId = req.user.userId;
    const student=await Student.findById(studentId);
    if (!student || !student.email) {
    return res.status(404).json({ message: 'Student or email not found' });
    }
    const email=student.email;
    const { jobId } = req.body;
    const withdrawToken = req.cookies?.WithdrawToken;
    if (!withdrawToken) {
      return res.status(400).json({ message: 'Withdraw token not found' });
    }
    const decodedToken = jwt.verify(withdrawToken, process.env.JWT_SECRET);
    if (!decodedToken || decodedToken.studentId?.toString() !== studentId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const withdrawtokenData=await Withdrawtoken.findOne({studentId});
    console.log(withdrawtokenData);
    if (!withdrawtokenData) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    if (decodedToken.withdrawId !== withdrawtokenData.withdrawId) {
        return res.status(401).json({ message: "Withdraw Token expired" });
    }

    // Delete the form submission
    const deletedSubmission = await FormSubmission.findOneAndDelete({ jobId, studentId });
    if (!deletedSubmission) {
      return res.status(404).json({ message: 'Not Applied or already Withdrawn' });
    }

    // Remove student from Applied_Students in JobProfile
    await JobProfile.findOneAndUpdate(
      { _id: jobId },
      { $pull: { Applied_Students: studentId } },
      { new: true }
    );

    // Remove student from eligible_students in Hiring_Workflow
    await JobProfile.findOneAndUpdate(
      {
        _id: jobId,
        "Hiring_Workflow.0": { $exists: true },
      },
      {
        $pull: { "Hiring_Workflow.0.eligible_students": studentId },
      },
      { new: true }
    );
     const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS,
                },
              });
              const mailOptions = {
                  from: process.env.EMAIL_USER,
                  to: email,
                  subject: 'Application Withdrawn Sucesssfully',
                  html: `<p>Dear User,</p>
      <p><strong>Your application has been withdrawn successfully.</strong></p>
      <p>If it is not done by you, please contact us immediately.</p>
      <p>IP which has withdrawn the application: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}</p>
      <p>Thank you,<br/>TPO Dev Team</p>`,
              };
              await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Application withdrawn successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to withdraw application', error: err.message });
  }
};

export const editApplication = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const { jobId, fields, resumeUrl } = req.body;
    // Check if the student is eligible for the job
    const eligibility = await JobEligibility.findOne({ jobId, studentId });
    if (!eligibility || !eligibility.eligible) {
      return res.status(403).json({ message: 'You are not eligible to apply for this job' });
    }
      const updatedFields = fields.map((field) => {
      if (field.isAutoFilled && field.studentPropertyPath) {
        let value;
        if (field.studentPropertyPath === 'cgpa %') {
          // Special case: multiply cgpa by 10 if it exists
          value = student['cgpa'] != null ? student['cgpa'] * 10 : '';
        } else {
          // Use the database value, default to empty string if null/undefined
          value = student[field.studentPropertyPath] ?? '';
        }
        return { ...field, value };
      }
      return field;
    });
    // Find and update the form submission
    const updatedSubmission = await FormSubmission.findOneAndUpdate(
      { jobId, studentId },
      { fields: updatedFields, resumeUrl },
      { new: true }
    );
    if (!updatedSubmission) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.status(200).json({ message: 'Application updated successfully'});
  } catch (err) {
    res.status(500).json({ message: 'Failed to edit application', error: err.message });
  }
};

// Get Submissions Controller
export const getFormSubmissions = async (req, res) => {
    const { jobId } = req.params;
  
    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required.' });
    }
  
    try {
      const submissions = await FormSubmission.find({ jobId })
        .populate('studentId', 'name email rollno department category');

      res.status(200).json(submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ message: 'Failed to fetch form submissions.' });
    }
  };

  export const getFormSubmissionstorecruiter = async (req, res) => {
    const { jobId } = req.params;
      try {
        const submissions = await FormSubmission.find({ jobId, visible: true })
        .populate('studentId', 'name email rollno department');
 
        res.status(200).json(submissions);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Failed to fetch form submissions.' });
      }
  }
  
  export const deleteFormSubmission = async (req, res) => {
    const { id } = req.params;
    try {
      const submission = await FormSubmission.findById(id);
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found.' });
      }
      const { jobId, studentId } = submission;
      await FormSubmission.findByIdAndDelete(id);
      await JobProfile.findOneAndUpdate(
        { _id: jobId },
        { $pull: { Applied_Students: studentId } },
        { new: true }
      );
      await JobProfile.findOneAndUpdate(
        { _id: jobId, "Hiring_Workflow.0": { $exists: true } },
        { $pull: { "Hiring_Workflow.0.eligible_students": studentId } },
        { new: true }
      );
      res.status(200).json({ message: 'Submission deleted successfully.' });
    } catch (error) {
      console.error('Error deleting submission:', error);
      res.status(500).json({ message: 'Failed to delete submission.' });
    }
  };

  export const deleteAllFormSubmissions = async (req, res) => {
    const { jobId } = req.params;
  
    try {
      const submissions = await FormSubmission.find({ jobId });
      const studentIds = submissions.map(submission => submission.studentId);
      await FormSubmission.deleteMany({ jobId });
      await JobProfile.findOneAndUpdate(
        { _id: jobId },
        { $pull: { Applied_Students: { $in: studentIds } } },
        { new: true }
      );
      await JobProfile.findOneAndUpdate(
        { _id: jobId, "Hiring_Workflow.0": { $exists: true } },
        { $pull: { "Hiring_Workflow.0.eligible_students": { $in: studentIds } } },
        { new: true }
      );
      res.status(200).json({ message: 'All form submissions deleted successfully.' });
    } catch (error) {
      console.error('Error deleting form submissions:', error);
      res.status(500).json({ message: 'Failed to delete form submissions.' });
    }
  };

  export const makeVisible = async (req, res) => {
    const { jobId } = req.params;
    try {
      const updatedSubmissions = await FormSubmission.updateMany(
        { jobId },
        { $set: { visible: true } }
      );
      res.status(200).json(updatedSubmissions);
    } catch (error) {
      console.error('Error making form submissions visible:', error);
      res.status(500).json({ message: 'Failed to make form submissions visible.' });
    }
  };