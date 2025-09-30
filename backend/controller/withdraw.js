import Student from "../models/user_model/student.js";
import { v4 as uuidv4 } from "uuid";
import withdrawOtpVerification from "../models/withdrawotp.js";
import WithdrawToken from "../models/withdrawtoken.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";


const generateOTP = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return otp;
};

export const sendWithdrawOtp = async (req, res) => {
    const studentId = req.user.userId;
    const { jobId } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    
     const email = student.email;
     const expiry = new Date(Date.now() + 5 * 60 * 1000);
     const otp = generateOTP();

    await withdrawOtpVerification.findOneAndUpdate(
    {studentId},
    {
      studentId,
      jobId,
      otp,
      otpExpires: expiry,
      otpAttempts: 0,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      timestamp: new Date(),
    },
    { upsert: true, new: true }
  );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Withdraw Job Application Request",
      html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      
      <!-- Header -->
      <div style="background: linear-gradient(90deg, #0369A0, #04A6CF); padding: 16px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">Withdraw Application Verification</h2>
      </div>
      
      <!-- Body -->
      <div style="padding: 24px; background-color: #fafafa;">
        <p style="font-size: 16px;">Dear <strong>User</strong>,</p>
        
        <p style="font-size: 15px; margin-top: 12px;">
          You have requested to <strong>withdraw your job application</strong>. To confirm this action, please use the One-Time Password (OTP) below:
        </p>

        <!-- OTP Box -->
        <div style="margin: 20px 0; text-align: center;">
          <span style="display: inline-block; padding: 12px 24px; font-size: 22px; font-weight: bold; color: #ffffff; background-color: #0369A0; border-radius: 6px; letter-spacing: 2px;">
            ${otp}
          </span>
        </div>
        
        <p style="font-size: 15px; margin-top: 12px; color: #555;">
          This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone for your security.
        </p>
        
        <p style="font-size: 15px; margin-top: 12px; color: #555;">
          If you did not make this request, you can safely ignore this email and your application will remain active.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 13px; color: #777;">
        <p style="margin: 0;">Best regards,</p>
        <p style="margin: 0; font-weight: bold; color: #0369A0;">TPO Dev Team</p>
        <p style="margin-top: 8px; font-size: 12px; color: #999;">
          This is an automated security message. Please do not reply to this email.
        </p>
      </div>
      
    </div>
  </div>
`,
    };
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: "Failed to send OTP" });
      }
      res.status(200).json({ message: "OTP sent successfully" });
    });
  };

  export const verifyWithdrawOtp =async (req, res) => {
    const { otp,jobId } = req.body;
    const studentId = req.user.userId;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const otpVerification = await withdrawOtpVerification.findOne({ studentId });

    if (!otpVerification || !otpVerification.otp) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    if(otpVerification.jobId?.toString() !== jobId) {
      return res.status(400).json({ message: "Invalid OTP for this job application" });
    }
    if (otpVerification.otpAttempts >= 5) {
      return res.status(400).json({ message: "Too many wrong attempts." });
    }

    if (Date.now() > otpVerification.otpExpires) {
        return res.status(400).json({ message: "OTP has expired" });
    }

    if( otpVerification.otp !== otp) {
        otpVerification.otpAttempts += 1;
        await otpVerification.save();
        return res.status(400).json({ message: "Invalid OTP" });
    }

    await withdrawOtpVerification.deleteOne({ studentId });

    const withdrawId = uuidv4();

    await WithdrawToken.findOneAndUpdate(
      { studentId },
      {
        studentId,
        withdrawId,
        jobId,
        timestamp: new Date(),
      },
      { upsert: true, new: true }
    );

    const Withdrawtoken= jwt.sign({ studentId, withdrawId }, process.env.JWT_SECRET, { expiresIn: '10m' });
    res.cookie("WithdrawToken", Withdrawtoken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    res.status(200).json({ message: "OTP verified successfully" });
  };