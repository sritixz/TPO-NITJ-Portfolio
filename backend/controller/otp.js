import OtpVerification from "../models/OtpVerification.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const OTP_TTL_MINUTES = 5; // matches auth.js's reset-password OTP convention
const RESEND_COOLDOWN_SECONDS = 45;
const MAX_ATTEMPTS = 5;
const COOKIE_TTL_MINUTES = 30; // how long a verified email stays usable for form submit

// Same generator as auth.js's generateOTP, kept local so this file has
// no cross-dependency on auth.js internals.
const generateOTP = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return otp;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const otpEmailHtml = (otp, organizationName) => `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">

      <div style="background-color: #0369A0; padding: 16px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">Verify Your Email</h2>
      </div>

      <div style="padding: 24px; background-color: #fafafa;">
        <p style="font-size: 16px;">Dear <strong>${organizationName || "HR Partner"}</strong>,</p>

        <p style="font-size: 15px; margin-top: 12px;">
          Use the One-Time Password (OTP) below to verify your email and
          continue submitting the Job Announcement Form.
        </p>

        <div style="margin: 20px 0; text-align: center;">
          <span style="display: inline-block; padding: 12px 24px; font-size: 22px; font-weight: bold; color: #ffffff; background-color: #0369A0; border-radius: 6px; letter-spacing: 4px;">
            ${otp}
          </span>
        </div>

        <!--
          Note: click-to-copy via onclick/JS is stripped by most email
          clients (Gmail, Outlook, Apple Mail all block inline scripts),
          so this is a best-effort convenience link, not a guarantee.
          The code above is spaced out and large so it's easy to select
          and copy manually as the reliable fallback everywhere.
        -->
        <div style="text-align: center; margin-top: -8px;">
          <a href="javascript:navigator.clipboard.writeText('${otp}');"
             style="display:inline-block; margin-top: 10px; padding: 6px 16px; background-color:#e1e8ed; color:#0369A0; text-decoration:none; border-radius:6px; font-size: 12px; font-weight: 600;">
            Copy OTP
          </a>
        </div>

        <p style="font-size: 15px; margin-top: 16px; color: #555;">
          This OTP is valid for <strong>${OTP_TTL_MINUTES} minutes</strong>.
          Please do not share it with anyone.
        </p>

        <p style="font-size: 15px; margin-top: 12px; color: #555;">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>

      <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 13px; color: #777;">
        <p style="margin: 0;">Best regards,</p>
        <p style="margin: 0; font-weight: bold; color: #0369A0;">TPO Dev Team</p>
        <p style="margin-top: 8px; font-size: 12px; color: #999;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>

    </div>
  </div>
`;

// POST /jaf/send-otp   body: { email, organizationName? }
export const sendOtp = async (req, res) => {
  try {
    const { organizationName } = req.body;
    const email = (req.body.email || "").toLowerCase().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const existing = await OtpVerification.findOne({ email });
    if (existing) {
      const secondsSinceLastSend = (Date.now() - existing.timestamp.getTime()) / 1000;
      if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSend)}s before requesting another OTP.`,
        });
      }
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await OtpVerification.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        otpExpires,
        otpAttempts: 0,
        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        timestamp: new Date(),
      },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Job Announcement Form",
      html: otpEmailHtml(otp, organizationName),
    });

    return res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

// POST /jaf/verify-otp   body: { email, otp }
// On success, sets an httpOnly cookie (mirrors auth.js's resetPasswordToken
// pattern) instead of returning a token in the JSON body.
export const verifyOtp = async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const otp = (req.body.otp || "").toUpperCase().trim();

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const record = await OtpVerification.findOne({ email });
    if (!record || !record.otp) {
      return res.status(400).json({ message: "No OTP found for this email. Please request a new one." });
    }

    if (record.otpAttempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ message: "Too many incorrect attempts. Please request a new OTP." });
    }

    if (Date.now() > record.otpExpires) {
      await OtpVerification.deleteOne({ email });
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (record.otp !== otp) {
      record.otpAttempts += 1;
      await record.save();
      const attemptsLeft = MAX_ATTEMPTS - record.otpAttempts;
      return res.status(400).json({
        message: attemptsLeft > 0
          ? `Incorrect OTP. ${attemptsLeft} attempt(s) left.`
          : "Incorrect OTP. Please request a new one.",
      });
    }

    // Correct — burn the OTP record so it can't be reused, then issue
    // a short-lived, purpose-scoped cookie for the actual form submit.
    await OtpVerification.deleteOne({ email });

    const jafVerifiedToken = jwt.sign(
      { email, purpose: "jaf-email-verification" },
      process.env.JWT_SECRET,
      { expiresIn: `${COOKIE_TTL_MINUTES}m` }
    );

    res.cookie("jafEmailVerified", jafVerifiedToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + COOKIE_TTL_MINUTES * 60 * 1000),
    });

    return res.status(200).json({ message: "Email verified successfully.", verified: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify OTP", error: error.message });
  }
};
