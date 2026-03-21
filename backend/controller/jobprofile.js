import JobProfile from "../models/jobprofile.js";
import Student from "../models/user_model/student.js";
import Professor from "../models/user_model/professor.js";
import Recuiter from "../models/user_model/recuiter.js";
import FormSubmission from "../models/FormSubmission.js";
import FormTemplate from "../models/FormTemplate.js";
import Placement from "../models/placement.js";
import Internship from "../models/internship.js";
import Notification from "../models/notification.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import Feedback from "../models/Feedback.js";
import JobAnnouncementForm from "../models/jaf.js";
import JobEligibility from "../models/eligibility.js";
import axios from "axios";
import OfferTracker from "../models/offertracker.js";
import SummerInternTracker from "../models/summer_intern_tracker.js";
import Offer from "../models/offer.js";
import SummerIntern from "../models/summer_internship.js";
import Recruiter from "../models/user_model/recuiter.js";
import GuestHouseBooking from "../models/travel_planner/room.js";
import VehicleRequisition from "../models/travel_planner/vehicle.js";
import { encryptValue, decryptValue } from "../utils/security.js";
import fs from "fs";
import path from "path";

export const getAllCompanies = async (req, res) => {
  try {
    const companiesFromJobProfiles =
      await JobProfile.find().select("company_name -_id"); // Fetch only company_name, exclude _id
    const companiesFromRecruiters = await Recuiter.find().distinct("company"); // Fetch unique company names from Recuiter model

    // Combine and send unique company names
    const allCompanies = [
      ...new Set([
        ...companiesFromJobProfiles.map((company) => company.company_name),
        ...companiesFromRecruiters,
      ]),
    ];

    res.status(200).json(allCompanies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send email to a single student
const sendEmailToStudent = async (student, jobProfile) => {
  const deadlineDateTime = new Date(jobProfile.deadline).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    },
  );
  // Determine salary details based on job_type
  let salaryDetails = "";
  if (jobProfile.job_type === "Intern") {
    salaryDetails = `<tr>
            <td style="padding: 8px; font-weight: bold;">💸 Stipend:</td>
            <td style="padding: 8px;">${jobProfile.job_salary.stipend}</td>
          </tr>`;
  } else if (["Intern+PPO", "Intern+FTE"].includes(jobProfile.job_type)) {
    salaryDetails = `
      <tr>
            <td style="padding: 8px; font-weight: bold;">💸 Stipend:</td>
            <td style="padding: 8px;">${jobProfile.job_salary.stipend}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">💰 CTC:</td>
            <td style="padding: 8px;"> ${jobProfile.job_salary.ctc} LPA</td>
          </tr>
    `;
  } else if (jobProfile.job_type === "FTE") {
    salaryDetails = `<tr>
            <td style="padding: 8px; font-weight: bold;">💰 CTC:</td>
            <td style="padding: 8px;"> ${jobProfile.job_salary.ctc} LPA</td>
          </tr>`;
  }
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: student.email,
    subject: `New Job Opportunity: ${jobProfile.job_role} at ${jobProfile.company_name}`,
    html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 650px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <div style="background: linear-gradient(90deg, #0369A0, #04A6CF); padding: 24px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 22px;">New Job Opportunity</h2>
        <p style="margin: 4px 0 0; font-size: 16px;">${jobProfile.job_role} at ${jobProfile.company_name}</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 24px; background-color: #fafafa;">
        <p style="font-size: 16px;">Dear <strong>Student</strong>,</p>
        
        <p style="font-size: 15px; margin-top: 10px;">
          We are excited to share a new job opening with you. Here are the details:
        </p>

        <table style="width: 100%; margin-top: 16px; border-collapse: collapse; font-size: 15px;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">🏢 Company:</td>
            <td style="padding: 8px;">${jobProfile.company_name}</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold;">💼 Job Role:</td>
            <td style="padding: 8px;">${jobProfile.job_role}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">📍 Location:</td>
            <td style="padding: 8px;">${jobProfile.joblocation}</td>
          </tr>
          ${salaryDetails ? `${salaryDetails}` : ""}
           <tr>
            <td style="padding: 8px; font-weight: bold;">⏳ Deadline:</td>
            <td style="padding: 8px; color: #d9534f; font-weight: bold;">${deadlineDateTime}</td>
          </tr>
        </table>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://ctp.nitj.ac.in/sdashboard/job-application/${jobProfile._id}" 
            style="background: linear-gradient(90deg, #0369A0, #04A6CF); color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 15px; font-weight: bold; display: inline-block; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            🔗 Apply Now on TPO NITJ Portal
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 13px; color: #777;">
        <p style="margin: 0;">Best regards,</p>
        <p style="margin: 0; font-weight: bold; color: #0369A0;">TPO-NITJ</p>
        <p style="margin-top: 8px; font-size: 12px; color: #999;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
      
    </div>
  </div>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send email to ${student.email}:`, error);
  }
};
export const createJobProfilecopy = async (req, res) => {
  try {
    // Extract recruiter ID from authenticated user
    const recruiter_id = req.user.userId;

    // Destructure request body
    const {
      job_id,
      company_name,
      company_logo,
      job_role,
      jobdescription,
      joblocation,
      job_type,
      internship_duration,
      job_category,
      job_sector,
      ctc,
      base_salary,
      stipend,
      deadline,
      Hiring_Workflow,
      eligibility_criteria,
    } = req.body;

    // Check if the recruiter is a TPO (Professor)
    const tpo = await Professor.findById(recruiter_id);
    const Approved_Status = !!tpo;

    // Process Hiring Workflow
    const processedWorkflow = Hiring_Workflow.map((step) => {
      const processedStep = {
        step_type: step.step_type,
        details: {},
        eligible_students: step.eligible_students || [],
        absent_students: [], // Added to match schema
        shortlisted_students: step.shortlisted_students || [],
      };

      switch (step.step_type) {
        case "OA":
          processedStep.details = {
            oa_date: step.details?.oa_date || "",
            oa_login_time: step.details?.oa_login_time || "",
            oa_duration: step.details?.oa_duration || "",
            oa_info: step.details?.oa_info || "",
            oa_link: [],
            oa_venue: step.details?.oa_venue || "",
          };
          break;

        case "Interview":
          processedStep.details = {
            interview_type: step.details?.interview_type || "",
            interview_date: step.details?.interview_date || "",
            interview_time: step.details?.interview_time || "",
            interview_info: step.details?.interview_info || "",
            interview_link: [],
            interview_venue: step.details?.interview_venue || "",
          };
          break;

        case "GD":
          processedStep.details = {
            gd_date: step.details?.gd_date || "",
            gd_time: step.details?.gd_time || "",
            gd_info: step.details?.gd_info || "",
            gd_link: [],
            gd_venue: step.details?.gd_venue || "",
          };
          break;

        case "Others":
          processedStep.details = {
            others_round_name: step.details?.others_round_name || "",
            others_date: step.details?.others_date || "",
            others_login_time: step.details?.others_login_time || "",
            others_duration: step.details?.others_duration || "",
            others_info: step.details?.others_info || "",
            others_link: [],
            others_venue: step.details?.others_venue || "",
          };
          break;

        case "Resume Shortlisting":
          processedStep.details = {};
          break;

        default:
          console.warn(`Unknown step type: ${step.step_type}`);
          processedStep.details = step.details || {};
      }
      return processedStep;
    });

    // Determine job_class based on CTC
    let job_class;
    if (ctc > 20 || job_sector === "PSU") {
      job_class = "A";
    } else if (ctc > 12 && ctc <= 20) {
      job_class = "B";
    } else if (ctc > 5 && ctc <= 12) {
      job_class = "C";
    } else if (ctc <= 5) {
      job_class = "D";
    } else {
      job_class = "D"; // Default for invalid/undefined CTC
    }
    console.log(job_class);
    // Create new JobProfile
    const jobProfile = new JobProfile({
      recruiter_id,
      job_id: job_id || "",
      company_name: company_name || "",
      company_logo: company_logo || "",
      job_role: job_role || "",
      jobdescription: jobdescription || "",
      joblocation: joblocation || "",
      job_type: job_type || "",
      internship_duration: internship_duration || "N/A",
      job_category: job_category || "",
      job_sector: job_sector || "Private",
      job_salary: {
        ctc: ctc || 0,
        base_salary: base_salary || "",
        stipend: stipend || "",
      },
      Hiring_Workflow: processedWorkflow || [],
      eligibility_criteria: eligibility_criteria || [],
      job_class,
      deadline: deadline || new Date(),
      Approved_Status,
      Applied_Students: [],
      final_shortlisted_students: [],
      completed: false,
      visibility: true,
      recruiter_editing_allowed: false,
      auditLogs: [],
    });

    // Save JobProfile to database
    const savedProfile = await jobProfile.save();

    const courseDurations = {
      "B.Tech": 4,
      "M.Tech": 2,
      "B.Sc.-B.Ed.": 4,
      MBA: 2,
      "M.Sc.": 2,
    };

    // Generate unique (course, admissionYear) combinations
    const uniqueGroups = new Set();
    eligibility_criteria.forEach((criteria) => {
      const course = criteria.course_allowed;
      const passingYear = criteria.eligible_batch;
      const duration = courseDurations[course] || 0;
      const admissionYear = passingYear - duration;
      const key = `${course.toLowerCase()}-${admissionYear}`;
      uniqueGroups.add(key);
    });

    // Mapping of course names to email prefixes
    const coursePrefixMap = {
      "B.Tech": "btech",
      "M.Tech": "mtech",
      "B.Sc.-B.Ed.": "bscbed",
      MBA: "mba",
      "M.Sc.": "msc",
    };

    // Send one email per unique (course, admissionYear) combination
    await Promise.all(
      Array.from(uniqueGroups).map(async (key) => {
        const [courseRaw, admissionYear] = key.split("-");
        const prefix =
          coursePrefixMap[
            Object.keys(coursePrefixMap).find(
              (c) => c.toLowerCase() === courseRaw,
            )
          ] || courseRaw;
        const email = `${prefix}${admissionYear}@nitj.ac.in`;

        const pseudoStudent = { email };
        await sendEmailToStudent(pseudoStudent, savedProfile);
      }),
    );

    return res.status(201).json({
      message: "Job profile created successfully!",
      data: savedProfile,
    });
  } catch (error) {
    console.error("Error creating job profile:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      message: "Failed to create job profile.",
      error: error.message,
    });
  }
};

// Controller for uploading attachment
export const uploadAttachment = async (req, res) => {
  console.log("hello from upload attachment");
  const { jobId } = req.params;
  const file = req.file;

  console.log(file);

  if (!file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const attachmentUrl = `/uploads/job_attachments/${file.filename}`;
  const attachmentName = file.originalname;

  try {
    console.log(jobId);
    const job = await JobProfile.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    console.log(job.attachments);

    const newAttachment = { name: attachmentName, url: attachmentUrl };
    job.attachments.push(newAttachment);
    await job.save();

    // Get the _id of the newly added attachment
    const addedAttachment = job.attachments[job.attachments.length - 1];

    res.json({
      success: true,
      attachment: {
        _id: addedAttachment._id,
        name: attachmentName,
        url: attachmentUrl,
      },
    });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Controller for deleting attachment
export const deleteAttachment = async (req, res) => {
  const { jobId, attachmentId } = req.params;
  console.log(jobId, attachmentId);
  try {
    const job = await JobProfile.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const attachmentIndex = job.attachments.findIndex(
      (att) => att._id.toString() === attachmentId,
    );

    if (attachmentIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Attachment not found" });
    }

    const attachment = job.attachments[attachmentIndex];

    console.log(attachment);

    const filePath = path.join(process.cwd(), attachment.url);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });

    // Remove from array
    job.attachments.splice(attachmentIndex, 1);
    await job.save();

    res.json({ success: true, message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getJobsByRecruiter = async (req, res) => {
  try {
    /*     const recruiterId = req.user.userId; */
    const company = req.params.company;
    const jobs = await JobProfile.find({ company_name: company });
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const toggleEditingAllowed = async (req, res) => {
  try {
    const { _id } = req.body;
    const job = await JobProfile.findById(_id);
    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job Profile not found" });
    }
    job.recruiter_editing_allowed = !job.recruiter_editing_allowed;
    await job.save();
    res.status(200).json({
      success: true,
      editing_allowed: job.recruiter_editing_allowed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getEditingAllowedStatus = async (req, res) => {
  try {
    const company = req.params.company;
    const recruiter = await Recuiter.findOne({ company });
    if (!recruiter) {
      return res
        .status(404)
        .json({ success: false, message: "Recruiter not found" });
    }
    res
      .status(200)
      .json({ success: true, editing_allowed: recruiter.editing_allowed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { _id } = req.params;
    const recruiter = await Recuiter.findById(userId);
    const professor = await Professor.findById(userId);
    const user = recruiter || professor;
    const job = await JobProfile.findById(_id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const oldJob = job.toObject();
    const updateData = req.body;

    if (updateData.Hiring_Workflow) {
      const newWorkflow = updateData.Hiring_Workflow;
      const oldWorkflow = oldJob.Hiring_Workflow || [];

      // Check if a new step is being added
      if (newWorkflow.length > oldWorkflow.length) {
        const newStep = newWorkflow[newWorkflow.length - 1]; // Get the newly added step
        const stepIndex = newWorkflow.length - 1;

        // Populate eligible_students based on step position
        if (stepIndex === 0) {
          // First step: use Applied_Students
          newStep.eligible_students = job.Applied_Students || [];
        } else {
          // Subsequent steps: use shortlisted_students from previous step
          newStep.eligible_students =
            oldWorkflow[stepIndex - 1]?.shortlisted_students || [];
        }

        // Ensure absent_students and shortlisted_students are initialized as empty arrays
        newStep.absent_students = newStep.absent_students || [];
        newStep.shortlisted_students = newStep.shortlisted_students || [];
      }

      // Ensure all steps have the correct structure
      updateData.Hiring_Workflow = newWorkflow.map((step) => ({
        step_type: step.step_type,
        details: step.details || {},
        eligible_students: step.eligible_students || [],
        absent_students: step.absent_students || [],
        shortlisted_students: step.shortlisted_students || [],
      }));
    }

    const detectNestedChanges = (oldObj, newObj) => {
      let diff = {};
      Object.keys(newObj).forEach((key) => {
        const oldValue = oldObj ? oldObj[key] : undefined;
        const newValue = newObj[key];
        if (Array.isArray(newValue) && Array.isArray(oldValue)) {
          const added = newValue.filter((item) => !oldValue.includes(item));
          const removed = oldValue.filter((item) => !newValue.includes(item));
          if (added.length > 0 || removed.length > 0) {
            diff[key] = { added, removed };
          }
        } else if (
          newValue &&
          typeof newValue === "object" &&
          !Array.isArray(newValue)
        ) {
          const nestedDiff = detectNestedChanges(oldValue, newValue);
          if (Object.keys(nestedDiff).length > 0) {
            diff[key] = nestedDiff;
          }
        } else if (oldValue !== newValue) {
          diff[key] = { oldValue, newValue };
        }
      });
      return diff;
    };

    const changes = detectNestedChanges(oldJob, updateData);
    console.log(changes);

    // Handle CTC change
    if (changes?.job_salary?.ctc || changes?.job_sector) {
      // const ctc = parseFloat(updateData?.job_salary?.ctc || oldJob?.job_salary?.ctc || 0);
      let ctc;
      if (updateData?.job_salary?.ctc === "") {
        ctc = 0;
      } else if (updateData?.job_salary?.ctc !== undefined) {
        ctc = parseFloat(updateData.job_salary.ctc);
      } else if (oldJob?.job_salary?.ctc !== undefined) {
        ctc = parseFloat(oldJob.job_salary.ctc);
      } else {
        ctc = 0;
      }

      const sector = updateData?.job_sector || oldJob?.job_sector || "Private";
      console.log("CTC:", ctc, "Sector:", sector);
      let job_class;

      if (ctc > 20 || sector === "PSU") {
        job_class = "A";
      } else if (ctc > 12 && ctc <= 20) {
        job_class = "B";
      } else if (ctc > 5 && ctc <= 12) {
        job_class = "C";
      } else if (ctc <= 5) {
        job_class = "D";
      } else {
        job_class = "D"; // Default for invalid/undefined CTC
      }
      console.log(job_class);

      updateData.job_class = job_class;
    }

    if (Object.keys(changes).length > 0) {
      const updatedJob = await JobProfile.findByIdAndUpdate(_id, updateData, {
        new: true,
      });

      updatedJob.auditLogs.push({
        editedBy: user._id,
        email: user.email,
        changes,
        timestamp: new Date(),
      });

      await updatedJob.save();
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: await JobProfile.findById(_id),
    });
  } catch (error) {
    console.error("Error updating job:", error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// export const updateJob = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { _id } = req.params;
//     const recruiter = await Recuiter.findById(userId);
//     const professor = await Professor.findById(userId);
//     const user = recruiter || professor;
//     const job = await JobProfile.findById(_id);

//     if (!job) {
//       return res.status(404).json({ success: false, message: 'Job not found' });
//     }

//     const oldJob = job.toObject();
//     const updateData = req.body;

//     // This function compares only the keys in newObj (updateData).
//     const detectNestedChanges = (oldObj, newObj) => {
//       let diff = {};

//       Object.keys(newObj).forEach(key => {
//         const oldValue = oldObj ? oldObj[key] : undefined;
//         const newValue = newObj[key];

//         // If both values are arrays, compare added/removed items.
//         if (Array.isArray(newValue) && Array.isArray(oldValue)) {
//           const added = newValue.filter(item => !oldValue.includes(item));
//           const removed = oldValue.filter(item => !newValue.includes(item));
//           if (added.length > 0 || removed.length > 0) {
//             diff[key] = { added, removed };
//           }
//         }
//         // If both values are objects (but not arrays), compare recursively.
//         else if (
//           newValue &&
//           typeof newValue === 'object' &&
//           !Array.isArray(newValue)
//         ) {
//           const nestedDiff = detectNestedChanges(oldValue, newValue);
//           if (Object.keys(nestedDiff).length > 0) {
//             diff[key] = nestedDiff;
//           }
//         }
//         // For all other types, log the change if values differ.
//         else if (oldValue !== newValue) {
//           diff[key] = { oldValue, newValue };
//         }
//       });

//       return diff;
//     };

//     // Compute differences only for the fields present in updateData.
//     const changes = detectNestedChanges(oldJob, updateData);

//     if (Object.keys(changes).length > 0) {
//       // Update the job document.
//       const updatedJob = await JobProfile.findByIdAndUpdate(
//         _id,
//         updateData,
//         { new: true }
//       );

//       // Log only the actual changes.
//       updatedJob.auditLogs.push({
//         editedBy: user._id,
//         email: user.email,
//         changes,
//         timestamp: new Date(),
//       });

//       await updatedJob.save();
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Job updated successfully',
//       job: await JobProfile.findById(_id)
//     });
//   } catch (error) {
//     console.error('Error updating job:', error.message);
//     res.status(500).json({ success: false, error: 'Server Error' });
//   }
// };

export const deleteJob = async (req, res) => {
  try {
    const { _id } = req.params;
    await JobProfile.findByIdAndDelete(_id);
    res
      .status(200)
      .json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
// export const getJobProfiletostudent = async (req, res) => {
//   try {
//     const studentId = req.user.userId;
//     if (!studentId) {
//       return res.status(400).json({ message: "User ID is missing in the request." });
//     }

//     const student = await Student.findById({ _id: studentId });
//     let batch='2026'

//     const course = student.course;

//     const JobProfiles = await JobProfile.find({
//       Approved_Status: true,
//       eligibility_criteria: {
//         $elemMatch: {
//           eligible_batch: batch,
//           course_allowed: course,
//         },
//       },
//     });

//     const applied = [];
//     const notApplied = [];
//     const liveButNotApplied = [];

//     const currentDate = new Date();

//     JobProfiles.forEach((job) => {
//       const isApplied = job.Applied_Students.includes(studentId);
//       const isLive = new Date(job.deadline) > currentDate;

//       if (isApplied) {
//         applied.push(job);
//       } else if (!isApplied && isLive) {
//         liveButNotApplied.push(job);
//       } else {
//         notApplied.push(job);
//       }
//     });

//     return res.status(200).json({
//       applied,
//       notApplied,
//       liveButNotApplied,
//     });
//   } catch (error) {
//     console.error("Error fetching job status:", error);
//     return res.status(500).json({ message: "An error occurred while fetching job status." });
//   }
// };

export const getJobProfiletostudent = async (req, res) => {
  try {
    const studentId = req.user.userId;
    if (!studentId) {
      return res
        .status(400)
        .json({ message: "User ID is missing in the request." });
    }

    const student = await Student.findById({ _id: studentId });
    let batch;

    try {
      const rollNumbers = [student.rollno];
      const payload = {
        rollNumbers,
        portalKey: process.env.ERP_IDENTITY_SECRET,
      };
      const encryptedData = encryptValue(JSON.stringify(payload));
      const course = student.course;
      const response = await axios.post(
        `${process.env.ERP_SERVER}`,
        encryptedData,
      );
      const erpStudents = response.data.data;
      const decryptedData = decryptValue(erpStudents);
      const erpData = JSON.parse(decryptedData)[0];
      console.log(erpData);
      const erpBatch = erpData.batch;

      const courseDurations = {
        "B.Tech": 4,
        "M.Tech": 2,
        "B.Sc.-B.Ed.": 4,
        MBA: 2,
        "M.Sc.": 2,
      };
      const adjustment = courseDurations[course] || 0;
      const adjustedBatch = String(Number(erpBatch) + adjustment);
      batch = adjustedBatch;
    } catch (erpError) {
      console.error(
        "ERP server error, falling back to database batch:",
        erpError,
      );
      batch = student.batch;
    }

    const course = student.course;

    const JobProfiles = await JobProfile.find({
      Approved_Status: true,
      eligibility_criteria: {
        $elemMatch: {
          eligible_batch: batch,
          course_allowed: course,
        },
      },
    }).sort({ createdAt: -1 });

    const applied = [];
    const notApplied = [];
    const liveButNotApplied = [];

    const currentDate = new Date();

    JobProfiles.forEach((job) => {
      const isApplied = job.Applied_Students.includes(studentId);
      const isLive = new Date(job.deadline) > currentDate;

      if (isApplied) {
        applied.push(job);
      } else if (!isApplied && isLive) {
        liveButNotApplied.push(job);
      } else {
        notApplied.push(job);
      }
    });

    return res.status(200).json({
      applied,
      notApplied,
      liveButNotApplied,
    });
  } catch (error) {
    console.error("Error fetching job status:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching job status." });
  }
};

export const getJobProfiledetails = async (req, res) => {
  try {
    const { _id } = req.params;
    const job = await JobProfile.findById(_id);
    res.status(200).json({ job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getJobProfilesForProfessors = async (req, res) => {
  try {
    const approvedJobs = await JobProfile.find({
      Approved_Status: true,
      completed: false,
    }).sort({ createdAt: -1 });
    const notApprovedJobs = await JobProfile.find({
      Approved_Status: false,
    }).sort({ createdAt: -1 });
    const completed = await JobProfile.find({ completed: true }).sort({
      updatedAt: -1,
    });
    const feedbacks = await Feedback.find({});
    const feedbackByCompany = feedbacks.reduce((acc, feedback) => {
      acc[feedback.company] = feedback;
      return acc;
    }, {});

    const jafs = await JobAnnouncementForm.find({});
    const jafByCompany = jafs.reduce((acc, jaf) => {
      acc[jaf.organizationName] = jaf;
      return acc;
    }, {});
    const guestHouseBookings = await GuestHouseBooking.find({}).sort({
      updatedAt: -1,
    });
    const vehicleRequisitions = await VehicleRequisition.find({}).sort({
      updatedAt: -1,
    });
    res.status(200).json({
      approved: approvedJobs,
      notApproved: notApprovedJobs,
      completed: completed,
      feedbackByCompany,
      jafByCompany,
      guestHouseBookings,
      vehicleRequisitions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getspecificJobProfilesForProfessors = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobProfile.findById(id);
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const approveJobProfile = async (req, res) => {
  try {
    const { _id } = req.params;

    const approvedJob = await JobProfile.findByIdAndUpdate(
      _id,
      { Approved_Status: true },
      { new: true },
    );
    if (!approvedJob) return res.status(404).json({ message: "Job not found" });
    res.status(200).json({ message: "Job approved successfully", approvedJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const completedJobProfile = async (req, res) => {
  try {
    const { _id } = req.params;
    const completedJob = await JobProfile.findByIdAndUpdate(
      _id,
      { completed: true },
      { new: true },
    );
    if (!completedJob)
      return res.status(404).json({ message: "Job not found" });
    res
      .status(200)
      .json({ message: "Job completed successfully", completedJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const incompletedJobProfile = async (req, res) => {
  try {
    const { _id } = req.params;
    const incompletedJob = await JobProfile.findByIdAndUpdate(
      _id,
      { completed: false },
      { new: true },
    );
    if (!incompletedJob)
      return res.status(404).json({ message: "Job not found" });
    res
      .status(200)
      .json({ message: "Job incompleted successfully", incompletedJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rejectJobProfile = async (req, res) => {
  try {
    const { _id } = req.params;
    const deletedJob = await JobProfile.findByIdAndDelete(_id);

    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res
      .status(200)
      .json({ message: "Job application deleted successfully", deletedJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const checkEligibility = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { _id } = req.params;
    const student = await Student.findById(studentId);
    const job = await JobProfile.findById(_id);
    if (!student || !job) {
      return res
        .status(404)
        .json({ message: "Student or Job Application not found" });
    }

    const currentDate = new Date();
    const hasApplied = job.Applied_Students.includes(studentId);
    const isDeadlineOver = job.deadline && currentDate > job.deadline;

    // Check for isInterested only if the field exists
    if (
      student.batch === "2026" &&
      typeof student.isInterested !== "undefined" &&
      student.isInterested === false
    ) {
      return res.json({
        eligible: false,
        reason: "You were not interested during placement registration",
      });
    }

    let updatedStudent;
    try {
      const rollNumbers = [student.rollno];
      const payload = {
        rollNumbers,
        portalKey: process.env.ERP_IDENTITY_SECRET,
      };
      const encryptedData = encryptValue(JSON.stringify(payload));
      const course = student.course;
      const response = await axios.post(
        `${process.env.ERP_SERVER}`,
        encryptedData,
      );
      const erpStudents = response.data.data;
      const decryptedData = decryptValue(erpStudents);
      const erpData = JSON.parse(decryptedData)[0];
      const erpBatch = erpData.batch;
      const courseDurations = {
        "B.Tech": 4,
        "M.Tech": 2,
        "B.Sc.-B.Ed.": 4,
        MBA: 2,
        "M.Sc.": 2,
      };
      const adjustment = courseDurations[course] || 0;
      const adjustedBatch = String(Number(erpBatch) + adjustment);
      updatedStudent = {
        ...student.toObject(),
        cgpa: erpData.cgpa,
        batch: adjustedBatch,
        active_backlogs: erpData.active_backlogs === "true",
        backlogs_history: erpData.backlogs_history === "true",
        activeBacklogCount: erpData.activeBacklogCount,
      };
    } catch (erpError) {
      console.error(
        "ERP server error, falling back to database data:",
        erpError,
      );
      updatedStudent = student.toObject();
    }

    if (
      (job.job_type === "Intern" ||
        job.job_type === "Intern+FTE" ||
        job.job_type === "Intern+PPO") &&
      updatedStudent.activeBacklogCount > 3
    ) {
      return res.json({
        eligible: false,
        reason: "You have more than 3 active backlogs",
      });
    }

    const eligibilityCriteria = job.eligibility_criteria;
    let isEligible = false;
    let maxFailureDepth = -1; // Tracks the deepest failure across all criteria
    let deepestIneligibilityReason = "No matching eligibility criteria found";

    // Define the order of checks and their corresponding reasons
    const checkOrder = [
      { key: "batch", reason: "Batch not eligible" },
      { key: "course", reason: "Course not eligible" },
      { key: "department", reason: "Department not eligible" },
      { key: "gender", reason: "Gender not eligible" },
      { key: "cgpa", reason: "CGPA below required minimum" },
      {
        key: "active_backlogs",
        reason: "Active backlogs do not meet criteria",
      },
      {
        key: "history_backlogs",
        reason: "Backlogs history do not meet criteria",
      },
    ];

    for (const criteria of eligibilityCriteria) {
      const {
        department_allowed,
        course_allowed,
        gender_allowed,
        eligible_batch,
        minimum_cgpa,
        active_backlogs,
        history_backlogs,
      } = criteria;

      let currentFailureDepth = -1;
      let currentIneligibilityReason = "";

      // Check if student is debarred
      if (updatedStudent.debarred) {
        return res.json({
          eligible: false,
          reason: "You are debarred from Campus Placement",
        });
      }

      // Check eligibility in the defined order
      if (eligible_batch && eligible_batch !== updatedStudent.batch) {
        currentFailureDepth = 0; // Batch check failed
        currentIneligibilityReason = checkOrder[0].reason;
      } else if (course_allowed && course_allowed !== updatedStudent.course) {
        currentFailureDepth = 1; // Course check failed
        currentIneligibilityReason = checkOrder[1].reason;
      } else if (!department_allowed.includes(updatedStudent.department)) {
        currentFailureDepth = 2; // Department check failed
        currentIneligibilityReason = checkOrder[2].reason;
      } else if (
        gender_allowed !== "Any" &&
        gender_allowed !== updatedStudent.gender
      ) {
        currentFailureDepth = 3; // Gender check failed
        currentIneligibilityReason = checkOrder[3].reason;
      } else if (minimum_cgpa && updatedStudent.cgpa < minimum_cgpa) {
        currentFailureDepth = 4; // CGPA check failed
        currentIneligibilityReason = checkOrder[4].reason;
      } else if (
        active_backlogs !== undefined &&
        active_backlogs === false &&
        updatedStudent.active_backlogs !== false
      ) {
        currentFailureDepth = 5; // Active backlogs check failed
        currentIneligibilityReason = checkOrder[5].reason;
      } else if (
        history_backlogs !== undefined &&
        history_backlogs === false &&
        updatedStudent.backlogs_history !== false
      ) {
        currentFailureDepth = 6; // History backlogs check failed
        currentIneligibilityReason = checkOrder[6].reason;
      } else {
        isEligible = true;
        break;
      }
      if (currentFailureDepth > maxFailureDepth) {
        maxFailureDepth = currentFailureDepth;
        deepestIneligibilityReason = currentIneligibilityReason;
      }
    }

    if (!isEligible) {
      return res.json({ eligible: false, reason: deepestIneligibilityReason });
    }

    //now evaluating according to college placement policy
    const jobType = job.job_type;
    const jobSector = job.job_sector;
    const jobCategory = job.job_class;
    const jobctc = job.job_salary.ctc;

    // if student is 3rd year B.Tech student then checking for summer intern
    if (updatedStudent.batch == "2027" && updatedStudent.course == "B.Tech") {
      const SummerInternHistory = await SummerInternTracker.findOne({
        batch: "2027",
        course: "B.Tech",
      });
      if (SummerInternHistory?.studentsId.includes(studentId)) {
        return res.json({
          eligible: false,
          reason: "You have already Summer Intern",
        });
      }
    }

    // if student is not btech 3rd year student then we will deal with offer tracker
    else {
      if (
        (jobType === "Intern+FTE" || jobType === "FTE") &&
        (jobctc == 0 || !jobctc)
      ) {
        return res.json({
          eligible: false,
          reason: "CTC is not mentioned, please inform TPO",
        });
      }
      const studentOfferHistory = await OfferTracker.findOne({ studentId });

      // if any offer that student has, is PSU offer then he will not be eligible for any other job offer
      if (studentOfferHistory?.offer?.some((o) => o.offer_sector === "PSU")) {
        return res.json({
          eligible: false,
          reason: "You have already PSU Offer",
        });
      }

      if (studentOfferHistory?.offer.length >= 2) {
        return res.json({
          eligible: false,
          reason: "You already have two or more offers",
        });
      }
      // now for courses 'M.Tech', 'M.Sc.', 'MBA', 'B.Sc.-B.Ed.' we have one person one job policy
      if (
        updatedStudent.course === "M.Tech" ||
        updatedStudent.course === "M.Sc." ||
        updatedStudent.course === "MBA" ||
        updatedStudent.course === "B.Sc.-B.Ed."
      ) {
        const currentCTC = +studentOfferHistory?.offer[0].offer_ctc || 0;
        const jobCTC = +jobctc || 0;
        if (studentOfferHistory?.offer.length == 1) {
          if (
            studentOfferHistory?.offer[0].offer_type === "Intern+FTE" ||
            studentOfferHistory?.offer[0].offer_type === "FTE"
          ) {
            return res.json({
              eligible: false,
              reason: "You have already one FTE Offer",
              applied: hasApplied,
            });
          } else if (
            (studentOfferHistory?.offer[0].offer_type === "Intern" ||
              studentOfferHistory?.offer[0].offer_type === "Intern+PPO") &&
            studentOfferHistory?.offer[0].offer_intern_duration > 6
          ) {
            return res.json({
              eligible: false,
              reason: "You have already one Offer",
              applied: hasApplied,
            });
          }
          //I am assuming when ctc is not mentioned in intern+ppo by company then it is 0
          else if (
            (studentOfferHistory?.offer[0].offer_type === "Intern" ||
              studentOfferHistory?.offer[0].offer_type === "Intern+PPO") &&
            studentOfferHistory?.offer[0].offer_intern_duration <= 6
          ) {
            if (jobCategory === "D") {
              return res.json({
                eligible: false,
                reason: "You have already one similar Offer",
                applied: hasApplied,
              });
            } else if (studentOfferHistory?.offer[0].offer_category === "A") {
              if (jobCategory === "D" || jobCategory === "A") {
                return res.json({
                  eligible: false,
                  reason: "You have already A category Offer",
                  applied: hasApplied,
                });
              }
              if (
                (jobCategory === "C" || jobCategory === "B") &&
                (jobType === "Intern" ||
                  jobType === "Intern+PPO" ||
                  jobType === "Intern+FTE")
              ) {
                return res.json({
                  eligible: false,
                  reason: "You have already A category Offer",
                  applied: hasApplied,
                });
              }
            } else if (
              studentOfferHistory?.offer[0].offer_category === "B" &&
              (jobCategory === "D" ||
                jobCategory === "C" ||
                jobCategory === "B" ||
                (jobCategory === "A" && jobCTC < currentCTC + 5))
            ) {
              return res.json({
                eligible: false,
                reason:
                  "You have already B category Offer or job ctc has less diff. than expected w.r.t current offer ctc",
                applied: hasApplied,
              });
            } else if (
              studentOfferHistory?.offer[0].offer_category === "C" &&
              (jobCategory === "D" ||
                jobCategory === "C" ||
                (jobCategory === "A" && jobCTC < currentCTC + 3))
            ) {
              return res.json({
                eligible: false,
                reason:
                  "You have already C category Offer or job ctc has less diff. than expected w.r.t current offer ctc",
                applied: hasApplied,
              });
            } else if (
              studentOfferHistory.offer[0].offer_category === "D" &&
              (jobCategory === "D" ||
                (jobCategory === "C" && jobCTC < currentCTC + 2))
            ) {
              return res.json({
                eligible: false,
                reason:
                  "You have already D category Offer or job ctc has less diff. than expected w.r.t current offer ctc",
                applied: hasApplied,
              });
            }
          }
        }
      }

      // for B.Tech students we have two offers policy
      else if (updatedStudent.course === "B.Tech") {
        // console.log("B.Tech student offer history", studentOfferHistory?.offer);
        // console.log("B.Tech student job category", jobCategory);
        // console.log("B.Tech student job type", jobType);
        // console.log("B.Tech student job ctc", jobctc);

        if (studentOfferHistory?.offer.length == 1) {
          const currentCTC = +studentOfferHistory?.offer[0].offer_ctc || 0;
          const jobCTC = +jobctc || 0;
          //if the offer is intern or (intern+ppo with ctc, not mentioned or 0) then he can apply a job_category A, B, C
          // if(jobCategory==='D' && (studentOfferHistory?.offer[0].offer_type === 'Intern' || (studentOfferHistory?.offer[0].offer_type === 'Intern+PPO' && studentOfferHistory?.offer[0].offer_ctc <= 0))){
          //     return res.json({ eligible: false, reason: "You have already D category Offer" });
          // }
          //now if he will have a offer with category A then he will be not eligible for any offer
          // if(studentOfferHistory?.offer[0].offer_type === 'Intern' || studentOfferHistory?.offer[0].offer_type === 'Intern+PPO'){
          //   if((studentOfferHistory?.offer[0].offer_type === 'Intern+PPO' && studentOfferHistory?.offer[0].offer_ctc <= 0) || studentOfferHistory?.offer[0].offer_type === 'Intern'){
          //       if(jobCategory === 'D' && (jobType==='Intern' || jobType==='Intern+PPO' || jobType==='Intern+FTE')){
          //        return res.json({ eligible: false, reason: "You have already D category Offer" });
          //       }
          //   }
          //   else if(studentOfferHistory?.offer[0].offer_type === 'Intern+PPO' && studentOfferHistory?.offer[0].offer_ctc > 0 ){
          //       if(jobCategory === 'D' && studentOfferHistory?.offer[0].offer_category==='D' && (jobType==='Intern' || jobType==='Intern+PPO' || jobType==='Intern+FTE')){
          //        return res.json({ eligible: false, reason: "You have already D category Inter+PPO Offer" });
          //       }
          //       if((jobCategory === 'D' || jobCategory ==='C') && studentOfferHistory?.offer[0].offer_category==='C' && (jobType==='Intern' || jobType==='Intern+PPO' || jobType==='Intern+FTE')){
          //        return res.json({ eligible: false, reason: "You have already C category Inter+PPO Offer" });
          //       }
          //       if((jobCategory === 'D' || jobCategory === 'C' || jobCategory ==='B') && studentOfferHistory?.offer[0].offer_category==='B' && (jobType==='Intern' || jobType==='Intern+PPO' || jobType==='Intern+FTE')){
          //        return res.json({ eligible: false, reason: "You have already B category Inter+PPO Offer" });
          //       }
          //       if((jobCategory === 'D' || jobCategory === 'C' || jobCategory ==='B' || jobCategory ==='A') && studentOfferHistory?.offer[0].offer_category==='A' && (jobType==='Intern' || jobType==='Intern+PPO' || jobType==='Intern+FTE')){
          //        return res.json({ eligible: false, reason: "You have already A category Inter+PPO Offer" });
          //       }
          //   }
          // }

          console.log(
            studentOfferHistory.offer[0].offer_category,
            jobCategory,
            jobCTC,
            currentCTC,
          );
          // if(studentOfferHistory?.offer[0].offer_type === 'Intern+FTE' || studentOfferHistory?.offer[0].offer_type === 'FTE'){

          //to allow students having intern or intern + ppo in any category company for FTE so avoiding category check for them
          const currentOffer = studentOfferHistory?.offer?.[0];
          const currentOfferType = currentOffer?.offer_type;
          const isInternLikeOffer =
            (currentOfferType === "Intern" || currentOfferType === "Intern+PPO") && (jobType === "FTE" || jobType === "Intern+FTE");
          console.log("LIKE", isInternLikeOffer)
          if (!isInternLikeOffer) {
            console.log("Checking ccategories")
            if (studentOfferHistory?.offer[0].offer_category === "A") {
              //  if(studentOfferHistory?.offer[0].offer_type==='Intern+FTE' || studentOfferHistory?.offer[0].offer_type==='FTE'){
              //   return res.json({ eligible: false, reason: "You have already A category Offer" });
              //  }
              //  if(studentOfferHistory?.offer[0].offer_type==='Intern+PPO' || studentOfferHistory?.offer[0].offer_type==='Intern'){
              //     if(jobCategory === 'D' || jobCategory ==='A'){
              //      return res.json({ eligible: false, reason: "You have already A category Offer" });
              //      }
              //     if((jobCategory === 'C' || jobCategory === 'B') && (jobType==='Intern'|| jobType==='Intern+PPO' || jobType==='Intern+FTE')){
              //       return res.json({ eligible: false, reason: "You have already A category Offer" });
              //      }
              return res.json({
                eligible: false,
                reason: "You have already A category Offer",
                applied: hasApplied,
              });
            } else if (
              studentOfferHistory?.offer[0].offer_category === "B" &&
              (jobCategory === "D" ||
                jobCategory === "C" ||
                jobCategory === "B" ||
                (jobCategory === "A" && jobCTC < currentCTC + 5))
            ) {
              return res.json({
                eligible: false,
                reason:
                  "You have already B category Offer or job ctc has less diff. than expected w.r.t current offer ctc",
                applied: hasApplied,
              });
            } else if (
              studentOfferHistory?.offer[0].offer_category === "C" &&
              (jobCategory === "D" ||
                jobCategory === "C" ||
                (jobCategory === "B" && jobCTC < currentCTC + 3) ||
                (jobCategory === "A" && jobCTC < currentCTC + 3))
            ) {
              return res.json({
                eligible: false,
                reason:
                  "You have already C category Offer or job ctc has less diff. than expected w.r.t current offer ctc",
                applied: hasApplied,
              });
            } 
            // else if (
            //   (studentOfferHistory.offer[0].offer_category === "D" ||
            //     studentOfferHistory?.offer[0].offer_type === "Intern" ||
            //     (studentOfferHistory?.offer[0].offer_type === "Intern+PPO" &&
            //       studentOfferHistory?.offer[0].offer_ctc <= 0)) &&
            //   (jobCategory === "D" ||
            //     (jobCategory === "C" && jobCTC < currentCTC + 2) ||
            //     (jobCategory === "A" && jobCTC < currentCTC + 2) ||
            //     (jobCategory === "B" && jobCTC < currentCTC + 2))
            // ) {
            //   return res.json({
            //     eligible: false,
            //     reason:
            //       "You have already D category Offer or job ctc has less diff. than expected w.r.t current offer ctc",
            //     applied: hasApplied,
            //   });
            // }
             else if (
              (studentOfferHistory.offer[0].offer_category === "D") &&
              (jobCategory === "D" ||
                (jobCategory === "C" && jobCTC < currentCTC + 2) ||
                (jobCategory === "A" && jobCTC < currentCTC + 2) ||
                (jobCategory === "B" && jobCTC < currentCTC + 2))
            ) {
              return res.json({
                eligible: false,
                reason:
                  "You have already D category Offer or job ctc has less diff. than expected w.r.t current offer ctc",
                applied: hasApplied,
              });
            }
          }
        }
        // }
      }
    }
    // const currentDate = new Date();
    // const isDeadlineOver = job.deadline && currentDate > job.deadline;
    // const hasApplied = job.Applied_Students.includes(studentId);

    const jobEligibility = await JobEligibility.findOne({
      studentId,
      jobId: _id,
    });
    if (jobEligibility) {
      jobEligibility.eligible = true;
      await jobEligibility.save();
    } else {
      const newJobEligibility = new JobEligibility({
        studentId,
        jobId: _id,
        eligible: true,
      });
      await newJobEligibility.save();
    }

    return res.json({
      eligible: true,
      reason: "Eligible to apply",
      applied: hasApplied,
      isDeadlineOver,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const addfinalshortlistStudent = async (req, res) => {
  const { jobId, students, combinations } = req.body;
  try {
    // Validate jobId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    // Validate job existence
    const job = await JobProfile.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    const isNoneShortlisted = !students || students.length === 0;

if (isNoneShortlisted) {
  for (const combo of combinations) {
    const { batch, course } = combo;

    if (!batch || !course) continue;

    if (course === "B.Tech" && batch === "2027") {
      let summerIntern = await SummerIntern.findOne({
        jobId,
        batch,
        course,
      });

      if (!summerIntern) {
        summerIntern = new SummerIntern({
          jobId,
          company_name: job.company_name,
          batch,
          course,
          offer_mode: "On-Campus",
          offer_sector: job.job_sector || "Private",
          result_date: new Date(),
          shortlisted_students: [],
          visibility: true,
        });
      } else {
        summerIntern.shortlisted_students = [];
      }

      await summerIntern.save();
    } else {
      let offer = await Offer.findOne({ jobId, batch, course });

      if (!offer) {
        offer = new Offer({
          jobId,
          company_name: job.company_name,
          batch,
          course,
          offer_mode: "On-Campus",
          offer_sector: job.job_sector || "Private",
          result_date: new Date(),
          shortlisted_students: [],
          visibility: true,
        });
      } else {
        offer.shortlisted_students = [];
      }

      await offer.save();
    }
  }

  // Clear job shortlist
  job.final_shortlisted_students = [];
  await job.save();

  return res.status(200).json({
    message: "Company added with no shortlisted students",
  });
}
    // Validate input
    if (!Array.isArray(students) || students.length === 0) {
      return res
        .status(400)
        .json({ error: "Students array is required and cannot be empty" });
    }

    // Validate student IDs and group by batch, course, and action
    const groupedStudents = {};
    for (const student of students) {
      if (
        !student.studentId ||
        !mongoose.Types.ObjectId.isValid(student.studentId)
      ) {
        return res.status(400).json({
          error: `Invalid or missing student ID: ${student.studentId || "undefined"}`,
        });
      }
      if (!["add", "remove"].includes(student.action)) {
        return res.status(400).json({
          error: `Invalid action for student ${student.studentId}: ${student.action}`,
        });
      }

      const studentData = await Student.findById(student.studentId);
      if (!studentData) {
        return res
          .status(404)
          .json({ error: `Student with ID ${student.studentId} not found` });
      }

      const key = `${studentData.batch}-${studentData.course}-${student.action}`;
      if (!groupedStudents[key]) {
        groupedStudents[key] = {
          batch: studentData.batch,
          course: studentData.course,
          action: student.action,
          students: [],
        };
      }

      if (student.action === "add") {
        groupedStudents[key].students.push({
          studentId: student.studentId,
          name: studentData.name,
          gender: studentData.gender,
          department: studentData.department,
          category: studentData.category,
          job_type: student.jobtype || job.job_type,
          job_role: student.jobrole || job.job_role,
          ctc:
            student.ctc ||
            (job.job_salary?.ctc !== "0" ? job.job_salary.ctc : undefined),
          stipend: student.stipend || job.job_salary?.stipend,
          intern_duration: student.internduration || job.internship_duration,
        });
      } else {
        groupedStudents[key].students.push({
          studentId: student.studentId,
        });
      }
    }

    // Validate existing final_shortlisted_students
    const validStudentIds = job.final_shortlisted_students
      .filter((id) => {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) {
          console.warn(
            `Invalid student ID found in JobProfile.final_shortlisted_students: ${id}`,
          );
        }
        return isValid;
      })
      .map((id) => id.toString());

    // Process each batch-course-action group
    for (const [key, group] of Object.entries(groupedStudents)) {
      const { batch, course, action, students } = group;

      if (course === "B.Tech" && batch === "2027") {
        let summerIntern = await SummerIntern.findOne({ jobId, batch, course });
        let summerInternTracker = await SummerInternTracker.findOne({
          batch,
          course,
        });

        if (action === "add") {
          if (!summerIntern) {
            summerIntern = new SummerIntern({
              jobId,
              company_name: job.company_name,
              batch,
              course,
              offer_mode: "On-Campus",
              offer_sector: job.job_sector || "Private",
              result_date: new Date(),
              shortlisted_students: students,
              visibility: true,
            });
          } else {
            summerIntern.shortlisted_students.push(...students);
          }
          await summerIntern.save();

          // Update SummerInternTracker
          if (!summerInternTracker) {
            summerInternTracker = new SummerInternTracker({
              batch,
              course,
              studentsId: students.map((s) =>
                mongoose.Types.ObjectId.createFromHexString(s.studentId),
              ),
            });
          } else {
            const newStudentIds = students.map((s) =>
              mongoose.Types.ObjectId.createFromHexString(s.studentId),
            );
            summerInternTracker.studentsId = [
              ...new Set([
                ...summerInternTracker.studentsId.map((id) => id.toString()),
                ...newStudentIds.map((id) => id.toString()),
              ]),
            ].map((id) => mongoose.Types.ObjectId.createFromHexString(id));
          }
          await summerInternTracker.save();
        } else if (action === "remove") {
          if (summerIntern) {
            summerIntern.shortlisted_students =
              summerIntern.shortlisted_students.filter(
                (s) =>
                  !students.some(
                    (student) => student.studentId === s.studentId.toString(),
                  ),
              );
            if (summerIntern.shortlisted_students.length === 0) {
              await SummerIntern.deleteOne({ _id: summerIntern._id });
            } else {
              await summerIntern.save();
            }
          }
          if (summerInternTracker) {
            const removeStudentIds = students.map((s) => s.studentId);
            summerInternTracker.studentsId =
              summerInternTracker.studentsId.filter(
                (id) => !removeStudentIds.includes(id.toString()),
              );
            if (summerInternTracker.studentsId.length === 0) {
              await SummerInternTracker.deleteOne({
                _id: summerInternTracker._id,
              });
            } else {
              await summerInternTracker.save();
            }
          }
        }
      } else {
        let offer = await Offer.findOne({ jobId, batch, course });

        if (action === "add") {
          if (!offer) {
            offer = new Offer({
              jobId,
              company_name: job.company_name,
              batch,
              course,
              offer_mode: "On-Campus",
              offer_sector: job.job_sector || "Private",
              result_date: new Date(),
              shortlisted_students: students,
              visibility: true,
            });
          } else {
            offer.shortlisted_students.push(...students);
          }
          await offer.save();

          // Update OfferTracker for each student
          for (const student of students) {
            let offer_category;
            if (student.ctc > 20 || job.job_sector === "PSU") {
              offer_category = "A";
            } else if (student.ctc > 12 && student.ctc <= 20) {
              offer_category = "B";
            } else if (student.ctc > 5 && student.ctc <= 12) {
              offer_category = "C";
            } else if (student.ctc <= 5) {
              offer_category = "D";
            } else {
              offer_category = "D"; // Default for invalid/undefined CTC
            }

            const offerDetails = {
              offer_type: student.job_type,
              offer_category: offer_category,
              offer_sector: job.job_sector || "Private",
              offer_ctc: student.ctc,
              offer_intern_duration: student.intern_duration,
            };

            let offerTracker = await OfferTracker.findOne({
              studentId: student.studentId,
            });
            if (!offerTracker) {
              offerTracker = new OfferTracker({
                studentId: mongoose.Types.ObjectId.createFromHexString(
                  student.studentId,
                ),
                offer: [offerDetails],
              });
            } else {
              offerTracker.offer.push(offerDetails);
            }
            await offerTracker.save();
          }
        } else if (action === "remove") {
          if (offer) {
            offer.shortlisted_students = offer.shortlisted_students.filter(
              (s) =>
                !students.some(
                  (student) => student.studentId === s.studentId.toString(),
                ),
            );
            if (offer.shortlisted_students.length === 0) {
              await Offer.deleteOne({ _id: offer._id });
            } else {
              await offer.save();
            }
          }

          // Remove from OfferTracker
          for (const student of students) {
            const offerTracker = await OfferTracker.findOne({
              studentId: student.studentId,
            });
            if (offerTracker) {
              // Remove the offer matching the jobId (assuming one offer per jobId for simplicity)
              offerTracker.offer = offerTracker.offer.filter(
                (o) =>
                  o.offer_type !==
                  students.find((s) => s.studentId === student.studentId)
                    ?.job_type,
              );
              if (offerTracker.offer.length === 0) {
                await OfferTracker.deleteOne({ _id: offerTracker._id });
              } else {
                await offerTracker.save();
              }
            }
          }
        }
      }

      // Update JobProfile's final_shortlisted_students
      if (action === "add") {
        const newStudentIds = students.map((s) => s.studentId);
        job.final_shortlisted_students = [
          ...new Set([...validStudentIds, ...newStudentIds]),
        ].map((id) => mongoose.Types.ObjectId.createFromHexString(id));
      } else if (action === "remove") {
        const removeStudentIds = students.map((s) => s.studentId);
        job.final_shortlisted_students = validStudentIds
          .filter((id) => !removeStudentIds.includes(id))
          .map((id) => mongoose.Types.ObjectId.createFromHexString(id));
      }
    }

    await job.save();

    return res.status(200).json({ message: "Shortlist updated successfully" });
  } catch (error) {
    console.error("Error in addfinalshortlistStudent:", error);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
};

export const addshortlistStudents = async (req, res) => {
  try {
    const { jobId, stepIndex, students } = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    const job = await JobProfile.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (stepIndex < 0 || stepIndex >= job.Hiring_Workflow.length) {
      return res.status(400).json({ error: "Invalid step index" });
    }

    const step = job.Hiring_Workflow[stepIndex];
    if (!step) {
      return res.status(400).json({ error: "Step not found" });
    }

    const studentIds = [];
    const absentIds = [];

    for (const student of students) {
      const studentId = student.studentId;

      if (student.absent) {
        if (step.shortlisted_students.includes(studentId)) {
          step.shortlisted_students = step.shortlisted_students.filter(
            (id) => id.toString() !== studentId.toString(),
          );
        }
        if (!step.absent_students.includes(studentId)) {
          absentIds.push(studentId);
        }
        for (let i = stepIndex + 1; i < job.Hiring_Workflow.length; i++) {
          const nextStep = job.Hiring_Workflow[i];
          nextStep.eligible_students = nextStep.eligible_students.filter(
            (id) => id.toString() !== studentId.toString(),
          );
          nextStep.shortlisted_students = nextStep.shortlisted_students.filter(
            (id) => id.toString() !== studentId.toString(),
          );
          nextStep.absent_students = nextStep.absent_students.filter(
            (id) => id.toString() !== studentId.toString(),
          );
        }
      } else if (student.shortlisted) {
        if (step.absent_students.includes(studentId)) {
          step.absent_students = step.absent_students.filter(
            (id) => id.toString() !== studentId.toString(),
          );
        }
        if (!step.shortlisted_students.includes(studentId)) {
          studentIds.push(studentId);
        }
      } else {
        if (step.shortlisted_students.includes(studentId)) {
          step.shortlisted_students = step.shortlisted_students.filter(
            (id) => id.toString() !== studentId.toString(),
          );
        }
        if (step.absent_students.includes(studentId)) {
          step.absent_students = step.absent_students.filter(
            (id) => id.toString() !== studentId.toString(),
          );
        }
        for (let i = stepIndex + 1; i < job.Hiring_Workflow.length; i++) {
          const nextStep = job.Hiring_Workflow[i];
          nextStep.eligible_students = nextStep.eligible_students.filter(
            (id) => id.toString() !== studentId.toString(),
          );
          nextStep.shortlisted_students = nextStep.shortlisted_students.filter(
            (id) => id.toString() !== studentId.toString(),
          );
          nextStep.absent_students = nextStep.absent_students.filter(
            (id) => id.toString() !== studentId.toString(),
          );
        }
      }
    }

    step.shortlisted_students.push(...studentIds);
    step.absent_students.push(...absentIds);

    if (job.Hiring_Workflow[stepIndex + 1]) {
      const nextStep = job.Hiring_Workflow[stepIndex + 1];
      for (const studentId of studentIds) {
        if (!nextStep.eligible_students.includes(studentId)) {
          nextStep.eligible_students.push(studentId);
        }
      }
    }
    // else {
    //   const jobType = job.job_type;
    //   const jobSector= job.job_sector;
    //   const createInternship = ['Intern', 'Intern+PPO', 'Intern+FTE'].includes(jobType);
    //   const createPlacement = ['Intern+FTE', 'FTE'].includes(jobType);
    //   const jobClassOrder = ["notplaced", "Below Dream", "Dream", "Super Dream"];
    //   let internshipDuration = job.internship_duration || 'N/A';

    //   // Group students by batch and degree
    //   const studentGroups = {};
    //   const studentsToRemove = new Set();

    //   for (const student of students) {
    //     const studentId = student.studentId;
    //     const dbStudent = await Student.findById(studentId);

    //     if (dbStudent) {
    //       const key = `${dbStudent.batch}-${dbStudent.course}`;

    //       if (!studentGroups[key]) {
    //         studentGroups[key] = {
    //           batch: dbStudent.batch,
    //           degree: dbStudent.course,
    //           students: [],
    //           jobId: jobId
    //         };
    //       }

    //       if (student.shortlisted) {
    //         studentGroups[key].students.push({
    //           studentId: studentId,
    //           name: dbStudent.name,
    //           image: dbStudent.image || '',
    //           email: dbStudent.email || 'N/A',
    //           gender: dbStudent.gender,
    //           department: dbStudent.department,
    //           category: dbStudent.category || 'N/A',
    //         });

    //         let jobClassIndex;
    //         if(jobType === "Intern" || (jobType === "Intern+PPO" && job.job_salary.ctc==0 ) ){
    //              jobClassIndex=1;
    //         }
    //         else{
    //           if (job.job_salary.ctc >= 20) {
    //             jobClassIndex = 3;
    //           }
    //           else if (job.job_salary.ctc < 4.5) {
    //             jobClassIndex = 0;
    //           }
    //           else if ((dbStudent.course === "B.Tech" || dbStudent.course === "M.Tech") && (dbStudent.department === "COMPUTER SCIENCE AND ENGINEERING" || dbStudent.department === "INFORMATION TECHNOLOGY"|| dbStudent.department ==="COMPUTER SCIENCE AND ENGINEERING (INFORMATION SECURITY)" || dbStudent.department ==="DATA SCIENCE AND ENGINEERING" || dbStudent.department ==="ARTIFICIAL INTELLIGENCE"|| dbStudent.department==="DATA ANALYTICS")) {
    //             if (job.job_salary.ctc >= 10 && job.job_salary.ctc < 20) {
    //               jobClassIndex = 2;
    //             } else {
    //               jobClassIndex = 1;
    //             }
    //           }
    //           else if ((dbStudent.course === "B.Tech" || dbStudent.course === "M.Tech") &&
    //                      (dbStudent.department === "ELECTRONICS AND COMMUNICATION ENGINEERING" ||
    //                       dbStudent.department === "INSTRUMENTATION AND CONTROL ENGINEERING" ||
    //                       dbStudent.department === "ELECTRONICS AND VLSI ENGINEERING" ||
    //                       dbStudent.department === "ELECTRICAL ENGINEERING"||
    //                       dbStudent.department === "CONTROL AND INSTRUMENTATION ENGINEERING")) {
    //             if (job.job_salary.ctc >= 8 && job.job_salary.ctc < 20) {
    //               jobClassIndex = 2;
    //             } else {
    //               jobClassIndex = 1;
    //             }
    //           } else if (dbStudent.course === "B.Tech" || dbStudent.course === "M.Tech") {
    //             if (job.job_salary.ctc >= 6 && job.job_salary.ctc < 20) {
    //               jobClassIndex = 2;
    //             } else {
    //               jobClassIndex = 1;
    //             }
    //           } else if (dbStudent.course === "MBA") {
    //             if (job.job_salary.ctc >= 5 && job.job_salary.ctc < 20) {
    //               jobClassIndex = 2;
    //             } else {
    //               jobClassIndex = 1;
    //             }
    //           } else if (dbStudent.course === "M.Sc.") {
    //             if (job.job_salary.ctc >= 6 && job.job_salary.ctc < 20) {
    //               jobClassIndex = 2;
    //             } else {
    //               jobClassIndex = 1;
    //             }
    //           }
    //         }

    //         if(createInternship){
    //           dbStudent.internshipstatus=internshipDuration;
    //         }
    //         if(createPlacement){
    //         dbStudent.placementstatus = jobClassOrder[jobClassIndex];
    //         }
    //         await dbStudent.save();

    //         let offerTracker = await OfferTracker.findOne({ studentId });
    //         if (!offerTracker) {
    //           offerTracker = new OfferTracker({ studentId, offer: [] });
    //         }

    //         const offerCategory = jobClassIndex === 0 ? 'Not Considered' :
    //                             jobClassIndex === 1 ? 'Below Dream' :
    //                             jobClassIndex === 2 ? 'Dream' : 'Super Dream';

    //         const offerExists = offerTracker.offer.some(
    //           offer => offer.jobId.toString() === jobId.toString()
    //         );

    //         if (!offerExists) {
    //           offerTracker.offer.push({
    //             offer_type: jobType,
    //             offer_category: offerCategory,
    //             offer_sector: jobSector,
    //             jobId: jobId
    //           });
    //           await offerTracker.save();
    //         }
    //       } else {
    //         // Track students to remove and remove from OfferTracker
    //         studentsToRemove.add(`${key}-${studentId}`);

    //         let offerTracker = await OfferTracker.findOne({ studentId });
    //         if (offerTracker) {
    //           offerTracker.offer = offerTracker.offer.filter(
    //             offer => offer.jobId != null && offer.jobId.toString() !== jobId.toString()
    //           );
    //           if (offerTracker.offer.length === 0) {
    //             await OfferTracker.deleteOne({ studentId });
    //           } else {
    //             await offerTracker.save();
    //           }
    //         }
    //       }
    //     } else {
    //       console.error(`Student not found for ID: ${studentId}`);
    //     }
    //   }

    //   // Process each batch-degree combination
    //   for (const key in studentGroups) {
    //     const group = studentGroups[key];
    //     const placementData = group.students;

    //     // Check for existing Internship
    //     if (createInternship) {
    //       let internship = await Internship.findOne({
    //         jobId: group.jobId,
    //         batch: group.batch,
    //         degree: group.degree
    //       });

    //       if (internship) {
    //         const existingStudentIds = new Set(
    //           internship.shortlisted_students.map(s => s.studentId.toString())
    //         );

    //         const newStudents = placementData.filter(
    //           student => !existingStudentIds.has(student.studentId.toString())
    //         );

    //         if (studentsToRemove.size > 0) {
    //           internship.shortlisted_students = internship.shortlisted_students.filter(
    //             student => !studentsToRemove.has(`${key}-${student.studentId.toString()}`)
    //           );
    //         }

    //         internship.shortlisted_students.push(...newStudents);
    //         internship.result_date = new Date();
    //         await internship.save();
    //       } else {
    //         const internship = new Internship({
    //           jobId: group.jobId,
    //           company_name: job.company_name,
    //           company_logo: job.company_logo || '',
    //           internship_offer_mode: 'On-Campus',
    //           internship_type: job.job_type,
    //           internship_category: job.job_category,
    //           internship_duration: internshipDuration,
    //           internship_sector: job.job_sector,
    //           batch: group.batch,
    //           degree: group.degree,
    //           stipend: job.job_salary?.stipend || 'N/A',
    //           role: job.job_role || '',
    //           result_date: new Date(),
    //           shortlisted_students: placementData,
    //         });
    //         await internship.save();
    //       }
    //     }

    //     // Check for existing Placement
    //     if (createPlacement) {
    //       console.log("placement create ho rhi hai");
    //       let placement = await Placement.findOne({
    //         jobId: group.jobId,
    //         batch: group.batch,
    //         degree: group.degree
    //       });

    //       if (placement) {
    //         const existingStudentIds = new Set(
    //           placement.shortlisted_students.map(s => s.studentId.toString())
    //         );

    //         const newStudents = placementData.filter(
    //           student => !existingStudentIds.has(student.studentId.toString())
    //         );

    //         if (studentsToRemove.size > 0) {
    //           placement.shortlisted_students = placement.shortlisted_students.filter(
    //             student => !studentsToRemove.has(`${key}-${student.studentId.toString()}`)
    //           );
    //         }

    //         placement.shortlisted_students.push(...newStudents);
    //         placement.result_date = new Date();
    //         await placement.save();
    //       } else {
    //         const placement = new Placement({
    //           jobId: group.jobId,
    //           company_name: job.company_name,
    //           company_logo: job.company_logo || '',
    //           placement_type: job.job_type,
    //           placement_category: job.job_category,
    //           placement_offer_mode: 'On-Campus',
    //           placement_sector: job.job_sector,
    //           batch: group.batch,
    //           degree: group.degree,
    //           ctc: job.job_salary?.ctc || 'N/A',
    //           base_salary: job.job_salary?.base_salary || 'N/A',
    //           role: job.job_role || '',
    //           result_date: new Date(),
    //           shortlisted_students: placementData,
    //         });
    //         await placement.save();
    //       }
    //     }
    //   }
    // }

    await job.save();
    res.status(200).json({ message: "Students processed successfully." });
  } catch (error) {
    console.error("Error shortlisting students:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const finalshortlisteligible = async (req, res) => {
//   try {
//     const { jobId } = req.body;

//     // Find job profile
//     const jobProfile = await JobProfile.findById(jobId);
//     if (!jobProfile) {
//       return res.status(404).json({ error: 'Job profile not found' });
//     }

//     // Determine eligible students based on hiring workflow
//     let eligible_studentsid;
//     if (jobProfile.Hiring_Workflow && jobProfile.Hiring_Workflow.length > 0) {
//       // Get shortlisted students from the last step of hiring workflow
//       const lastStep = jobProfile.Hiring_Workflow[jobProfile.Hiring_Workflow.length - 1];
//       eligible_studentsid = lastStep.shortlisted_students || [];
//     } else {
//       // If no hiring workflow, use all applied students
//       eligible_studentsid = jobProfile.Applied_Students || [];
//     }

//     if (!eligible_studentsid.length) {
//       return res.status(200).json({
//         eligibleStudents: [],
//         starredFields: []
//       });
//     }

//     // Fetch the form template to get starred fields
//     const formTemplate = await FormTemplate.findOne({ jobId });
//     if (!formTemplate) {
//       return res.status(404).json({ error: 'Form template not found' });
//     }

//     // Get fieldNames of starred fields
//     const starredFields = formTemplate.fields
//       .filter(field => field.fieldStar)
//       .map(field => ({
//         fieldName: field.fieldName,
//         fieldType: field.fieldType
//       }));

//     // Fetch student details and form submissions
//     const students = await Student.find(
//       { _id: { $in: eligible_studentsid } },
//       'name'
//     );

//     const submissions = await FormSubmission.find(
//       {
//         studentId: { $in: eligible_studentsid },
//         jobId
//       },
//       'studentId fields'
//     );

//     // Map submissions to include values of starred fields
//     const fieldValuesMap = {};
//     submissions.forEach(submission => {
//       const studentId = submission.studentId.toString();
//       fieldValuesMap[studentId] = {};
//       starredFields.forEach(starredField => {
//         const field = submission.fields.find(f => f.fieldName === starredField.fieldName);
//         fieldValuesMap[studentId][starredField.fieldName] = field ? field.value : '';
//       });
//     });

//     // Prepare response data
//     const eligibleStudents = students.map(student => {
//       const studentId = student._id.toString();
//       const studentData = {
//         studentId,
//         name: student.name,
//         shortlisted: jobProfile.final_shortlisted_students.includes(studentId),
//       };

//       // Add starred field values
//       starredFields.forEach(starredField => {
//         studentData[starredField.fieldName] = fieldValuesMap[studentId]?.[starredField.fieldName] || '';
//       });

//       return studentData;
//     });

//     res.status(200).json({
//       eligibleStudents,
//       starredFields
//     });
//   } catch (error) {
//     console.error('Error in finalshortlisteligible:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

export const finalshortlisteligible = async (req, res) => {
  try {
    const { jobId } = req.body;

    // Validate jobId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    // Find job profile
    const jobProfile = await JobProfile.findById(jobId);
    if (!jobProfile) {
      return res.status(404).json({ error: "Job profile not found" });
    }

    // Determine eligible students based on hiring workflow
    let eligible_studentsid;
    if (jobProfile.Hiring_Workflow && jobProfile.Hiring_Workflow.length > 0) {
      const lastStep =
        jobProfile.Hiring_Workflow[jobProfile.Hiring_Workflow.length - 1];
      eligible_studentsid = lastStep.shortlisted_students || [];
    } else {
      eligible_studentsid = jobProfile.Applied_Students || [];
    }

    if (!eligible_studentsid.length) {
      return res.status(200).json({
        eligibleStudents: [],
        starredFields: [],
      });
    }

    // Fetch the form template to get starred fields
    const formTemplate = await FormTemplate.findOne({ jobId });
    if (!formTemplate) {
      return res.status(404).json({ error: "Form template not found" });
    }

    // Get fieldNames of starred fields
    const starredFields = formTemplate.fields
      .filter((field) => field.fieldStar)
      .map((field) => ({
        fieldName: field.fieldName,
        fieldType: field.fieldType,
      }));

    // Fetch student details
    const students = await Student.find(
      { _id: { $in: eligible_studentsid } },
      "name batch course",
    );

    // Fetch form submissions
    const submissions = await FormSubmission.find(
      {
        studentId: { $in: eligible_studentsid },
        jobId,
      },
      "studentId fields",
    );

    // Map submissions to include values of starred fields
    const fieldValuesMap = {};
    submissions.forEach((submission) => {
      const studentId = submission.studentId.toString();
      fieldValuesMap[studentId] = {};
      starredFields.forEach((starredField) => {
        const field = submission.fields.find(
          (f) => f.fieldName === starredField.fieldName,
        );
        fieldValuesMap[studentId][starredField.fieldName] = field
          ? field.value
          : "";
      });
    });

    // Fetch offer and summer intern data for shortlisted students
    const finalShortlistedIds = jobProfile.final_shortlisted_students.map(
      (id) => id.toString(),
    );
    const offers = await Offer.find({
      jobId,
      "shortlisted_students.studentId": { $in: finalShortlistedIds },
    });
    const summerInterns = await SummerIntern.find({
      jobId,
      "shortlisted_students.studentId": { $in: finalShortlistedIds },
    });

    // Create a map for offer/summer intern data
    const offerDataMap = {};
    offers.forEach((offer) => {
      offer.shortlisted_students.forEach((student) => {
        const studentId = student.studentId.toString();
        offerDataMap[studentId] = {
          job_type: student.job_type,
          job_role: student.job_role,
          ctc: student.ctc,
          stipend: student.stipend,
          intern_duration: student.intern_duration,
        };
      });
    });

    summerInterns.forEach((intern) => {
      intern.shortlisted_students.forEach((student) => {
        const studentId = student.studentId.toString();
        offerDataMap[studentId] = {
          job_type: student.job_type,
          job_role: student.job_role,
          ctc: student.ctc,
          stipend: student.stipend,
          intern_duration: student.intern_duration,
        };
      });
    });

    // Prepare response data
    const eligibleStudents = students.map((student) => {
      const studentId = student._id.toString();
      const isShortlisted = finalShortlistedIds.includes(studentId);
      const studentData = {
        studentId,
        name: student.name,
        shortlisted: isShortlisted,
        batch: student.batch,
        course: student.course,
      };

      // Add starred field values
      starredFields.forEach((starredField) => {
        studentData[starredField.fieldName] =
          fieldValuesMap[studentId]?.[starredField.fieldName] || "";
      });

      // Add job-related fields
      if (isShortlisted) {
        const offerData = offerDataMap[studentId] || {};
        studentData.job_type = offerData.job_type || "";
        studentData.job_role = offerData.job_role || "";
        studentData.ctc = offerData.ctc || "";
        studentData.stipend = offerData.stipend || "";
        studentData.intern_duration = offerData.intern_duration || "";
      } else {
        studentData.job_type = jobProfile.job_type || "";
        studentData.job_role = jobProfile.job_role || "";
        studentData.ctc =
          jobProfile.job_salary?.ctc && jobProfile.job_salary.ctc !== "0"
            ? jobProfile.job_salary.ctc
            : "";
        studentData.stipend = jobProfile.job_salary?.stipend || "";
        studentData.intern_duration = jobProfile.internship_duration || "";
      }

      return studentData;
    });

    res.status(200).json({
      eligibleStudents,
      starredFields,
    });
  } catch (error) {
    console.error("Error in finalshortlisteligible:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
export const eligibleinthis = async (req, res) => {
  try {
    const { jobId, stepIndex } = req.body;
    const jobProfile = await JobProfile.findById(jobId);
    if (!jobProfile) {
      return res.status(404).json({ error: "Job profile not found" });
    }

    const step = jobProfile.Hiring_Workflow[stepIndex];
    if (!step) {
      return res.status(404).json({ error: "Step not found" });
    }

    const eligible_studentsid = step.eligible_students;
    const shortlisted_studentsid = step.shortlisted_students || [];
    const absent_studentsid = step.absent_students || [];

    // Fetch the form template to get starred fields
    const formTemplate = await FormTemplate.findOne({ jobId });
    if (!formTemplate) {
      return res.status(404).json({ error: "Form template not found" });
    }

    // Get fieldNames of starred fields
    const starredFields = formTemplate.fields
      .filter((field) => field.fieldStar)
      .map((field) => ({
        fieldName: field.fieldName,
        fieldType: field.fieldType,
      }));

    const students = await Student.find(
      { _id: { $in: eligible_studentsid } },
      "name",
    );
    const submissions = await FormSubmission.find(
      { studentId: { $in: eligible_studentsid }, jobId },
      "studentId fields",
    );

    // Map submissions to include values of starred fields
    const fieldValuesMap = {};
    submissions.forEach((submission) => {
      const studentId = submission.studentId.toString();
      fieldValuesMap[studentId] = {};
      starredFields.forEach((starredField) => {
        const field = submission.fields.find(
          (f) => f.fieldName === starredField.fieldName,
        );
        fieldValuesMap[studentId][starredField.fieldName] = field
          ? field.value
          : "";
      });
    });

    const eligibleStudents = students.map((student) => {
      const studentId = student._id.toString();
      const studentData = {
        studentId,
        name: student.name,
        shortlisted: shortlisted_studentsid.includes(studentId),
        absent: absent_studentsid.includes(studentId),
      };

      // Add starred field values
      starredFields.forEach((starredField) => {
        studentData[starredField.fieldName] =
          fieldValuesMap[studentId]?.[starredField.fieldName] || "";
      });

      return studentData;
    });

    res.status(200).json({
      eligibleStudents,
      starredFields,
    });
  } catch (error) {
    console.error("Error in eligibleinthis:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const viewshortlisting = async (req, res) => {
  try {
    const { jobId, stepIndex } = req.body;
    const jobProfile = await JobProfile.findById(jobId);
    if (!jobProfile) {
      return res.status(404).json({ error: "Job profile not found" });
    }

    const step = jobProfile.Hiring_Workflow[stepIndex];
    if (!step) {
      return res.status(404).json({ error: "Step not found" });
    }

    const shortlisted_studentsid = step.shortlisted_students || [];

    // Fetch the form template to get starred fields
    const formTemplate = await FormTemplate.findOne({ jobId });
    if (!formTemplate) {
      return res.status(404).json({ error: "Form template not found" });
    }

    // Get fieldNames of starred fields
    const starredFields = formTemplate.fields
      .filter((field) => field.fieldStar)
      .map((field) => ({
        fieldName: field.fieldName,
        fieldType: field.fieldType,
      }));

    const students = await Student.find(
      { _id: { $in: shortlisted_studentsid } },
      "name",
    );
    const submissions = await FormSubmission.find(
      { studentId: { $in: shortlisted_studentsid }, jobId },
      "studentId fields",
    );

    // Map submissions to include values of starred fields
    const fieldValuesMap = {};
    submissions.forEach((submission) => {
      const studentId = submission.studentId.toString();
      fieldValuesMap[studentId] = {};
      starredFields.forEach((starredField) => {
        const field = submission.fields.find(
          (f) => f.fieldName === starredField.fieldName,
        );
        fieldValuesMap[studentId][starredField.fieldName] = field
          ? field.value
          : "";
      });
    });

    const shortlistedStudents = students.map((student) => {
      const studentId = student._id.toString();
      const studentData = {
        studentId,
        name: student.name,
      };

      // Add starred field values
      starredFields.forEach((starredField) => {
        studentData[starredField.fieldName] =
          fieldValuesMap[studentId]?.[starredField.fieldName] || "";
      });

      return studentData;
    });

    res.status(200).json({
      shortlistedStudents,
      starredFields, // Include starred fields in response for dynamic rendering
    });
  } catch (error) {
    console.error("Error in viewshortlisting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateInterviewLink = async (req, res) => {
  try {
    const { jobId, stepIndex, students } = req.body;
    const jobProfile = await JobProfile.findById(jobId);
    if (!jobProfile) {
      return res.status(404).json({ message: "Job profile not found" });
    }
    const step = jobProfile.Hiring_Workflow[stepIndex];
    if (!step) {
      return res
        .status(404)
        .json({ message: "Step not found in the hiring workflow" });
    }
    if (!step.details.interview_link) {
      step.details.interview_link = [];
    }
    const updatePromises = students.map(async (student) => {
      const { studentId, interviewLink, visibility } = student;
      const existingLinkIndex = step.details.interview_link.findIndex(
        (link) => link.studentId.toString() === studentId.toString(),
      );
      if (existingLinkIndex !== -1) {
        step.details.interview_link[existingLinkIndex].interviewLink =
          interviewLink;
        step.details.interview_link[existingLinkIndex].visibility = visibility; // Update visibility
      } else {
        step.details.interview_link.push({
          studentId,
          interviewLink,
          visibility: visibility, // Add visibility field
        });
      }

      return {
        status: "success",
        message: "Interview link updated successfully",
      };
    });
    const results = await Promise.all(updatePromises);
    jobProfile.markModified(`Hiring_Workflow.${stepIndex}.details`);
    await jobProfile.save();
    return res.status(200).json({
      message: "Interview links processing completed",
      results,
      data: step.details.interview_link,
    });
  } catch (error) {
    console.error("Error updating interview links:", error);
    return res.status(500).json({
      message: "Failed to update interview links.",
      error: error.message,
    });
  }
};

export const updategdLink = async (req, res) => {
  try {
    const { jobId, stepIndex, students } = req.body;
    const jobProfile = await JobProfile.findById(jobId);
    if (!jobProfile) {
      return res.status(404).json({ message: "Job profile not found" });
    }
    const step = jobProfile.Hiring_Workflow[stepIndex];
    if (!step) {
      return res
        .status(404)
        .json({ message: "Step not found in the hiring workflow" });
    }
    if (!step.details.gd_link) {
      step.details.gd_link = [];
    }
    const updatePromises = students.map(async (student) => {
      const { studentId, gdLink, visibility } = student;
      const existingLinkIndex = step.details.gd_link.findIndex(
        (link) => link.studentId.toString() === studentId.toString(),
      );
      if (existingLinkIndex !== -1) {
        step.details.gd_link[existingLinkIndex].gdLink = gdLink;
        step.details.gd_link[existingLinkIndex].visibility = visibility;
      } else {
        step.details.gd_link.push({
          studentId,
          gdLink,
          visibility,
        });
      }

      return {
        status: "success",
        message: "GD link updated successfully",
      };
    });
    const results = await Promise.all(updatePromises);
    jobProfile.markModified(`Hiring_Workflow.${stepIndex}.details`);
    await jobProfile.save();
    return res.status(200).json({
      message: "GD links processing completed",
      results,
      data: step.details.gd_link,
    });
  } catch (error) {
    console.error("Error updating gd links:", error);
    return res.status(500).json({
      message: "Failed to update gd links.",
      error: error.message,
    });
  }
};

export const updateoaLink = async (req, res) => {
  try {
    const { jobId, stepIndex, students } = req.body;
    const jobProfile = await JobProfile.findById(jobId);
    if (!jobProfile) {
      return res.status(404).json({ message: "Job profile not found" });
    }
    const step = jobProfile.Hiring_Workflow[stepIndex];
    if (!step) {
      return res
        .status(404)
        .json({ message: "Step not found in the hiring workflow" });
    }
    if (!step.details.oa_link) {
      step.details.oa_link = [];
    }
    const updatePromises = students.map(async (student) => {
      const { studentId, oaLink, visibility } = student;
      const existingLinkIndex = step.details.oa_link.findIndex(
        (link) => link.studentId.toString() === studentId.toString(),
      );
      if (existingLinkIndex !== -1) {
        step.details.oa_link[existingLinkIndex].oaLink = oaLink;
        step.details.oa_link[existingLinkIndex].visibility = visibility;
      } else {
        step.details.oa_link.push({
          studentId,
          oaLink,
          visibility,
        });
      }
      return {
        status: "success",
        message: "OA link updated successfully",
      };
    });
    const results = await Promise.all(updatePromises);
    jobProfile.markModified(`Hiring_Workflow.${stepIndex}.details`);
    await jobProfile.save();
    return res.status(200).json({
      message: "OA links processing completed",
      results,
      data: step.details.oa_link,
    });
  } catch (error) {
    console.error("Error updating oa links:", error);
    return res.status(500).json({
      message: "Failed to update oa links.",
      error: error.message,
    });
  }
};

export const updateOthersLink = async (req, res) => {
  try {
    const { jobId, stepIndex, students } = req.body;
    const jobProfile = await JobProfile.findById(jobId);
    if (!jobProfile) {
      return res.status(404).json({ message: "Job profile not found" });
    }
    const step = jobProfile.Hiring_Workflow[stepIndex];
    if (!step) {
      return res
        .status(404)
        .json({ message: "Step not found in the hiring workflow" });
    }
    if (!step.details.others_link) {
      step.details.others_link = [];
    }
    const updatePromises = students.map(async (student) => {
      const { studentId, othersLink, visibility } = student;
      const existingLinkIndex = step.details.others_link.findIndex(
        (link) => link.studentId.toString() === studentId.toString(),
      );
      if (existingLinkIndex !== -1) {
        step.details.others_link[existingLinkIndex].othersLink = othersLink;
        step.details.others_link[existingLinkIndex].visibility = visibility;
      } else {
        step.details.others_link.push({
          studentId,
          othersLink,
          visibility,
        });
      }
      return {
        status: "success",
        message: "Others link updated successfully",
      };
    });
    const results = await Promise.all(updatePromises);
    jobProfile.markModified(`Hiring_Workflow.${stepIndex}.details`);
    await jobProfile.save();
    return res.status(200).json({
      message: "Others links processing completed",
      results,
      data: step.details.others_link,
    });
  } catch (error) {
    console.error("Error updating others links:", error);
    return res.status(500).json({
      message: "Failed to update others links.",
      error: error.message,
    });
  }
};
