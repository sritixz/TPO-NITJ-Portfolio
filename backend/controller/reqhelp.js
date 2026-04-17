import Issue from "../models/reqhelp.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import Recuiter from "../models/user_model/recuiter.js";
import Professor from "../models/user_model/professor.js";
import Student from "../models/user_model/student.js";



export const createIssue = async (req, res) => {
  try {
    const { title, description, contact } = req.body;
    const userId = req.user.userId;
    const userType = req.user.userType;

    // Find or create issue
    let issue = await Issue.findOne({ title });
    if (!issue) {
      issue = await Issue.create({ title, details: [] });
    }

    const newDetail = {
      userId,
      onModel: userType,
      description,
      contact,
      status: "Pending",
      raisedAt: new Date(),
    };

    issue.details.push(newDetail);
    await issue.save();

    const userModel = mongoose.model(userType);
    const user = await userModel.findById(userId, "name email rollno");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const formattedDate = new Date().toLocaleString();

    const mailOptions = {
  from: `"Placement Portal" <${process.env.EMAIL_USER}>`,
  to: "query4ctp@nitj.ac.in",
  subject: `New Issue Raised by ${user?.name}`,
  html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">

      <!-- Header -->
      <div style="background-color: #ca0700ff; padding: 16px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">New Issue Raised</h2>
      </div>

      <!-- Body -->
      <div style="padding: 24px; background-color: #fafafa;">

        <p style="font-size: 16px;">
          A new issue has been raised on the <strong>Placement Portal</strong>.
        </p>

        <!-- Student Info -->
        <div style="margin-top: 18px; padding: 16px; background-color: #ffffff; border-radius: 6px; border: 1px solid #eee;">
          <p style="margin: 0; font-size: 15px;"><b>Student Name:</b> ${user?.name || "N/A"}</p>
          <p style="margin: 4px 0; font-size: 15px;"><b>Email:</b> ${user?.email || "N/A"}</p>
          <p style="margin: 4px 0; font-size: 15px;"><b>Roll No:</b> ${user?.rollno || "N/A"}</p>
          <p style="margin: 4px 0; font-size: 15px;"><b>Contact:</b> ${contact}</p>
        </div>

        <!-- Issue Info -->
        <div style="margin-top: 18px; padding: 16px; background-color: #ffffff; border-radius: 6px; border-left: 4px solid #ca0700ff;">
          <p style="margin: 0; font-size: 15px;">
            <b>Issue Title:</b> ${title}
          </p>

          <p style="margin-top: 10px; font-size: 14px; color: #555;">
            <b>Description:</b><br/>
            ${description}
          </p>
        </div>

        <!-- Timestamp -->
        <p style="font-size: 14px; margin-top: 18px; color: #666;">
          <b>Raised At:</b> ${formattedDate}
        </p>

        <p style="font-size: 14px; margin-top: 16px; color: #555;">
          Please review and take necessary action at the earliest.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 13px; color: #777;">
        <p style="margin: 0;">Placement Portal Notification</p>
        <p style="margin: 4px 0; font-weight: bold; color: #ca0700ff;">
          Dr. B. R. Ambedkar National Institute of Technology, Jalandhar
        </p>
        <p style="margin-top: 8px; font-size: 12px; color: #999;">
          This is an automated message. Please do not reply directly to this email.
        </p>
      </div>

    </div>
  </div>
  `,
};

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "Issue created and email sent",
      data: issue,
    });

  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error,
    });
  }
};
export const getUserIssues = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find issues containing at least one pending/resolved detail for this user
    const unresolvedIssues = await Issue.find({
      details: { $elemMatch: { userId, status: "Pending" } },
    });

    const resolvedIssues = await Issue.find({
      details: { $elemMatch: { userId, status: "Resolved" } },
    });

    // Filter out other users' details before sending
    const filterUserDetails = (issues, status) => {
      return issues.map((issue) => {
        const filteredDetails = issue.details.filter(
          (detail) =>
            detail.userId.toString() === userId.toString() &&
            detail.status === status
        );
        return { ...issue.toObject(), details: filteredDetails };
      });
    };

    const filteredUnresolved = filterUserDetails(unresolvedIssues, "Pending");
    const filteredResolved = filterUserDetails(resolvedIssues, "Resolved");

    res.status(200).json({
      success: true,
      unresolved: filteredUnresolved,
      resolved: filteredResolved,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};


// export const resolveIssue = async (req, res) => {
//   try {
//     const { issueId, detailId } = req.params;
//     const { comment } = req.body;
//     const professorId = req.user.userId;

//     const issue = await Issue.findOneAndUpdate(
//       { _id: issueId, "details._id": detailId },
//       {
//         $set: {
//           "details.$.status": "Resolved",
//           "details.$.resolvedBy": professorId,
//           "details.$.resolvedAt": new Date(),
//           "details.$.comment": comment,
//         },
//       },
//       { new: true }
//     );

//     if (!issue) {
//       return res.status(404).json({ success: false, message: "Issue or Detail not found" });
//     }

//     res.status(200).json({ success: true, data: issue });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server Error", error });
//   }
// };

export const resolveIssue = async (req, res) => {
  try {
    const { issueId, detailId } = req.params;
    const { comment } = req.body;
    const professorId = req.user.userId;

    // Step 1: Update the issue detail
    const issue = await Issue.findOneAndUpdate(
      { _id: issueId, "details._id": detailId },
      {
        $set: {
          "details.$.status": "Resolved",
          "details.$.resolvedBy": professorId,
          "details.$.resolvedAt": new Date(),
          "details.$.comment": comment,
        },
      },
      { new: true }
    );

    if (!issue) {
      return res
        .status(404)
        .json({ success: false, message: "Issue or Detail not found" });
    }

    // Step 2: Find the updated detail and get the user info
    const resolvedDetail = issue.details.find(
      (d) => d._id.toString() === detailId
    );

    if (!resolvedDetail) {
      return res
        .status(404)
        .json({ success: false, message: "Resolved detail not found" });
    }

    // Step 3: Fetch the user's email from their respective model
    const userModel = mongoose.model(resolvedDetail.onModel);
    const user = await userModel.findById(resolvedDetail.userId, "name email");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found for this issue" });
    }

    // Step 4: Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

const formattedDate = new Date().toLocaleString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
}); 
// → "Nov 9, 2025, 3:42 PM"

    


const mailOptions = {
  from: `"Placement Portal" <${process.env.EMAIL_USER}>`,
  to: user.email,
  subject: "Your Issue Has Been Resolved",
  html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">

      <!-- Header -->
      <div style="background-color: #ca0700ff; padding: 16px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">Your Issue Has Been Resolved</h2>
      </div>

      <!-- Body -->
      <div style="padding: 24px; background-color: #fafafa;">
        <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>

        <p style="font-size: 15px; margin-top: 12px;">
          We're glad to inform you that your issue titled 
          <strong>${issue.title}</strong> has been marked as 
          <b style="color: #2e7d32;">Resolved</b>.
        </p>

        ${
          comment
            ? `
            <div style="margin-top: 18px; padding: 14px 18px; background-color: #fff; border-left: 4px solid #ca0700ff; border-radius: 4px;">
              <p style="margin: 0; font-size: 15px; color: #333;">
                <b>Note:</b><br />
                <span style="color: #555;">${comment}</span>
              </p>
            </div>
          `
            : ""
        }

        <p style="font-size: 15px; margin-top: 20px; color: #555;">
          <b>Resolved on:</b> ${formattedDate}
        </p>

        <p style="font-size: 15px; margin-top: 16px; color: #555;">
          If you believe this issue requires further attention, you may raise a new issue from your dashboard.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 13px; color: #777;">
        <p style="margin: 0;">Best Regards,</p>
        <p style="margin: 0; font-weight: bold; color: #ca0700ff;">Placement Cell Team</p>
        <p style="margin-top: 8px; font-size: 12px; color: #999;">
          This is an automated message from the Placement Portal. Please do not reply to this email.
        </p>
      </div>

    </div>
  </div>
  `,
};



    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({
        success: true,
        message: "Issue resolved and email notification sent.",
        data: issue,
      });
  } catch (error) {
    console.error("Error resolving issue:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find();

    const populatedIssues = await Promise.all(
      issues.map(async (issue) => {
        const populatedDetails = await Promise.all(
          issue.details.map(async (detail) => {
            if (detail.userId && detail.onModel) {
              const model = mongoose.model(detail.onModel);
              const user = await model.findById(
                detail.userId,
                "name email"
              );

              return {
                ...detail.toObject(),
                userId: user,
              };
            }
            return detail.toObject();
          })
        );

        return { ...issue.toObject(), details: populatedDetails };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedIssues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error,
    });
  }
};

export const getUnresolvedIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ "details.status": "Pending" });
    const populateDetails = async (issueList) => {
      return Promise.all(
        issueList.map(async (issue) => {
          // Keep only pending details
          const pendingDetails = issue.details.filter(
            (detail) => detail.status === "Pending"
          );

          // Populate user details for pending details
          const populatedDetails = await Promise.all(
            pendingDetails.map(async (detail) => {
              if (detail.userId && detail.onModel) {
                const model = mongoose.model(detail.onModel);
                const populatedUser = await model.findById(
                  detail.userId,
                  "name email"
                );
                return { ...detail.toObject(), userId: populatedUser };
              }
              return detail.toObject();
            })
          );

          return { ...issue.toObject(), details: populatedDetails };
        })
      );
    };

    const populatedIssues = await populateDetails(issues);

    console.log("issues", populatedIssues);

    res.status(200).json({ success: true, data: populatedIssues });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

  