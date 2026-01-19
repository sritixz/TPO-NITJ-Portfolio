import Outsider from "../../models/user_model/outsider.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import OtpVerificationOutsider from "../../models/outsource-internship/otpVerificationOutsider.js";
import OutsiderToken from "../../models/outsource-internship/tokenOutsider.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import LoginAttemptOutsider from "../../models/outsource-internship/loginAttempt.js";
import ResetPasswordTokenOutsider from "../../models/outsource-internship/resetpasswordOutsider.js"

export const handleOTPGeneration = async (req, res) => {
  const { email } = req.body;
  const generateOTP = (length = 6) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return otp;
  };

  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  const otp = generateOTP();

  await OtpVerificationOutsider.findOneAndUpdate(
    { email },
    {
      email,
      otp,
      otpExpires: expiry,
      otpAttempts: 0,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      timestamp: new Date(),
    },
    { upsert: true, new: true }
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification OTP",
    html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      
      <!-- Header -->
      <div style="background-color: #0369A0; padding: 16px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">Email Verification OTP</h2>
      </div>
      
      <!-- Body -->
      <div style="padding: 24px; background-color: #fafafa;">
        <p style="font-size: 16px;">Dear <strong>User</strong>,</p>
        
        <p style="font-size: 15px; margin-top: 12px;">
          We received a request for your email verification. Please use the One-Time Password (OTP) below to proceed:
        </p>

        <!-- OTP Box -->
        <div style="margin: 20px 0; text-align: center;">
          <span style="display: inline-block; padding: 12px 24px; font-size: 22px; font-weight: bold; color: #ffffff; background-color: #0369A0; border-radius: 6px; letter-spacing: 2px;">
            ${otp}
          </span>
        </div>
        
        <p style="font-size: 15px; margin-top: 12px; color: #555;">
          This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone for security reasons.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 13px; color: #777;">
        <p style="margin: 0;">Best regards,</p>
        <p style="margin: 0; font-weight: bold; color: #0369A0;">TPO Dev Team</p>
        <p style="margin-top: 8px; font-size: 12px; color: #999;">
          This is an automated message. Please do not reply to this email.
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

export const verifyOutsiderOtp = async (req, res) => {
  const { email, otp } = req.body;
  const otpVerification = await OtpVerificationOutsider.findOne({ email });

  if (!otpVerification || !otpVerification.otp) {
    return res.status(400).json({ message: "OTP not requested" });
  }
  //   if (otpVerification.otpAttempts >= 5) {
  //     return res.status(400).json({ message: "Too many wrong attempts." });
  //   }

  if (Date.now() > otpVerification.otpExpires) {
    return res.status(400).json({ message: "OTP has expired" });
  }

  if (otpVerification.otp !== otp) {
    otpVerification.otpAttempts += 1;
    await otpVerification.save();
    return res.status(400).json({ message: "Invalid OTP" });
  }

  await OtpVerificationOutsider.deleteOne({ email });

  const verificationId = uuidv4();

  await OutsiderToken.findOneAndUpdate(
    { email },
    {
      email,
      verificationId,
      timestamp: new Date(),
    },
    { upsert: true, new: true }
  );

  const tokenOutsider = jwt.sign(
    { email, verificationId },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );
  res.cookie("tokenOutsider", tokenOutsider, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  res.status(200).json({ message: "OTP verified successfully" });
};

export async function handleSignUp(req, res) {
  try {
    console.log("Cookies:", req.cookies);
    const token = req.cookies.tokenOutsider;

    // OTP token must exist
    if (!token) {
      return res.status(401).json({
        message: "OTP verification required",
      });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "OTP verification expired or invalid",
      });
    }

    const { email, verificationId } = decoded;

    // Check OTP verification record
    const verification = await OutsiderToken.findOne({ verificationId });

    if (!verification) {
      return res.status(403).json({
        message: "OTP verification not found",
      });
    }

    // Ensure email matches
    if (verification.email !== email) {
      return res.status(403).json({
        message: "Email mismatch",
      });
    }

    const {
      name,
      contact,
      email: bodyEmail,
      collegeName,
      collegeRollNo,
      password,
      gender,
    } = req.body;

    // Ensure same email used in signup
    if (bodyEmail !== email) {
      return res.status(403).json({
        message: "Email mismatch",
      });
    }

    // Check if user already exists
    const existingUser = await Outsider.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await Outsider.create({
      name,
      contact,
      email,
      collegeName,
      collegeRollNo,
      password: hashedPassword,
      gender,
    });

    // Cleanup (VERY IMPORTANT)
    await OutsiderToken.findOneAndDelete({ verificationId });
    res.clearCookie("tokenOutsider");

    return res.status(201).json({
      message: "Sign up successful",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export const checkOutsiderEmail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const user = await Outsider.findOne({ email });

  return res.status(200).json({
    exists: Boolean(user), // derived, NOT model field
  });
};

//LOGIN
export const handleLoginOutsider = async (req, res) => {
  const { email, password, captchaInput } = req.body;
  const captchaToken = req.cookies.captchaToken;

  if (!captchaToken) {
    console.error("CAPTCHA token missing");
    return res
      .status(400)
      .json({ success: false, error: "CAPTCHA token missing" });
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  try {
    const decoded = jwt.verify(captchaToken, process.env.JWT_SECRET);
    if (
      !decoded.verified ||
      decoded.expires < Date.now() ||
      decoded.attempts >= decoded.maxAttempts
    ) {
      res.clearCookie("captchaToken");
      return res
        .status(400)
        .json({ success: false, error: "Invalid or expired CAPTCHA" });
    }

    if (decoded.text !== captchaInput) {
      res.clearCookie("captchaToken");
      return res
        .status(400)
        .json({ success: false, error: "CAPTCHA not verified" });
    }
    let loginAttempt = await LoginAttemptOutsider.findOne({ email });
    if (loginAttempt && loginAttempt.isLocked) {
      if (Date.now() > loginAttempt.otpExpires) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Security OTP for Account Unlock",
          html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      
      <!-- Header -->
      <div style="background-color: #0369A0; padding: 16px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">Account Security Notice</h2>
      </div>
      
      <!-- Body -->
      <div style="padding: 24px; background-color: #fafafa;">
        <p style="font-size: 16px;">Dear <strong>User</strong>,</p>
        
        <p style="font-size: 15px; margin-top: 12px;">
          For your protection, we have <strong>temporarily locked your account for 24 hours</strong> due to multiple unauthorized access attempts.
        </p>

        <p style="font-size: 15px; margin-top: 12px;">
          To unlock your account, please use the One-Time Password (OTP) below:
        </p>

        <!-- OTP Box -->
        <div style="margin: 20px 0; text-align: center;">
          <span style="display: inline-block; padding: 12px 24px; font-size: 22px; font-weight: bold; color: #ffffff; background-color: #0369A0; border-radius: 6px; letter-spacing: 2px;">
            ${otp}
          </span>
        </div>
        
        <p style="font-size: 15px; margin-top: 12px; color: #555;">
          This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone for security reasons.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 13px; color: #777;">
        <p style="margin: 0;">Thank you,</p>
        <p style="margin: 0; font-weight: bold; color: #0369A0;">TPO Dev Team</p>
        <p style="margin-top: 8px; font-size: 12px; color: #999;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
      
    </div>
  </div>`,
        };
        await transporter.sendMail(mailOptions);
      }
      return res
        .status(400)
        .json({ message: "Account locked. Please check your email for OTP." });
    }
    const outsider = await Outsider.findOne({ email });

    if (
      !outsider
    ) {
      return res.status(401).json({ message: "Email is not Registered" });
    }

    const user = outsider

    let isPasswordValid;
    if (user.password.startsWith("$2")) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = password === user.password;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      await user.updateOne({ password: hashedPassword });
    }

    if (!isPasswordValid) {
      if (!loginAttempt) {
        loginAttempt = new LoginAttemptOutsider({ email, loginAttempts: 1 });
      } else {
        loginAttempt.loginAttempts += 1;
      }
      if (loginAttempt.loginAttempts == 3) {
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Security Alert: Suspicious Login Attempts Detected",
          html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      
      <!-- Header -->
      <div style="background-color: #ca0700ff; padding: 16px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">Suspicious Login Attempts Detected</h2>
      </div>
      
      <!-- Body -->
      <div style="padding: 24px; background-color: #fafafa;">
        <p style="font-size: 16px;">Dear <strong>User</strong>,</p>
        
        <p style="font-size: 15px; margin-top: 12px;">
          We noticed <strong>3 unsuccessful login attempts</strong> on your account.
        </p>
        
        <p style="font-size: 15px; margin-top: 12px;">
          If this was not you, we strongly recommend that you 
          <a href="https://ctp.nitj.ac.in/sdashboard/change-pass" style="color: #ca0700ff; font-weight: bold; text-decoration: none;">
            change your password immediately
          </a> 
          and review your recent account activity.
        </p>
        
        <p style="font-size: 15px; margin-top: 12px; color: #555;">
          To ensure your account remains secure, avoid sharing your credentials with anyone.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 13px; color: #777;">
        <p style="margin: 0;">Stay safe,</p>
        <p style="margin: 0; font-weight: bold; color: #ca0700ff;">TPO Dev Team</p>
        <p style="margin-top: 8px; font-size: 12px; color: #999;">
          This is an automated security alert. Please do not reply to this email.
        </p>
      </div>
      
    </div>
  </div>`,
        };
        await transporter.sendMail(mailOptions);
      }
      if (loginAttempt.loginAttempts >= 7) {
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        loginAttempt.isLocked = true;
        //   const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp = generateOTP();
        loginAttempt.otp = otp;
        loginAttempt.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        loginAttempt.ip = ip;
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Security OTP for Account Unlock",
          html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      
      <!-- Header -->
      <div style="background-color: #0369A0; padding: 16px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">Account Security Notice</h2>
      </div>
      
      <!-- Body -->
      <div style="padding: 24px; background-color: #fafafa;">
        <p style="font-size: 16px;">Dear <strong>User</strong>,</p>
        
        <p style="font-size: 15px; margin-top: 12px;">
          For your protection, we have <strong>temporarily locked your account for 24 hours</strong> due to multiple unauthorized access attempts.
        </p>

        <p style="font-size: 15px; margin-top: 12px;">
          To unlock your account, please use the One-Time Password (OTP) below:
        </p>

        <!-- OTP Box -->
        <div style="margin: 20px 0; text-align: center;">
          <span style="display: inline-block; padding: 12px 24px; font-size: 22px; font-weight: bold; color: #ffffff; background-color: #0369A0; border-radius: 6px; letter-spacing: 2px;">
            ${otp}
          </span>
        </div>
        
        <p style="font-size: 15px; margin-top: 12px; color: #555;">
          This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone for security reasons.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 13px; color: #777;">
        <p style="margin: 0;">Thank you,</p>
        <p style="margin: 0; font-weight: bold; color: #0369A0;">TPO Dev Team</p>
        <p style="margin-top: 8px; font-size: 12px; color: #999;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
      
    </div>
  </div>`,
        };
        await transporter.sendMail(mailOptions);
      }

      await loginAttempt.save();
      return res.status(401).json({ message: "Invalid password" });
    }

    if (loginAttempt) {
      await LoginAttemptOutsider.deleteOne({ email });
    }

    let userType = "";
    if (user == outsider) userType = "Outsider";
 
    const token = jwt.sign(
      { userId: user._id, userType: userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    if (!token) {
      return res.status(500).json({ message: "Failed to generate token" });
    }

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.clearCookie("captchaToken");
    res
      .status(200)
      .json({ message: "Login Successful", user: user, userType: userType });
  } catch (error) {
    console.error("Error in login route:", error);
    res.clearCookie("captchaToken");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//FORGOT PASSWORD
const generateOTP = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return otp;
};

export const sendResetPasswordOtp = async (req, res) => {
  const { email } = req.body;
  const user = await Outsider.findOne({email});

  if (!user)
    return res.status(401).json({ message: "Email is not registered" });
  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  const otp = generateOTP();

  await OtpVerificationOutsider.findOneAndUpdate(
    { email },
    {
      email,
      otp,
      otpExpires: expiry,
      otpAttempts: 0,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      timestamp: new Date(),
    },
    { upsert: true, new: true }
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      
      <!-- Header -->
      <div style="background-color: #0369A0; padding: 16px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">Password Reset Verification</h2>
      </div>
      
      <!-- Body -->
      <div style="padding: 24px; background-color: #fafafa;">
        <p style="font-size: 16px;">Dear <strong>User</strong>,</p>
        
        <p style="font-size: 15px; margin-top: 12px;">
          We received a request to reset your password. Please use the One-Time Password (OTP) below to proceed:
        </p>

        <!-- OTP Box -->
        <div style="margin: 20px 0; text-align: center;">
          <span style="display: inline-block; padding: 12px 24px; font-size: 22px; font-weight: bold; color: #ffffff; background-color: #0369A0; border-radius: 6px; letter-spacing: 2px;">
            ${otp}
          </span>
        </div>
        
        <p style="font-size: 15px; margin-top: 12px; color: #555;">
          This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone for security reasons.
        </p>
        
        <p style="font-size: 15px; margin-top: 12px; color: #555;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f4f4f4; padding: 16px; text-align: center; font-size: 13px; color: #777;">
        <p style="margin: 0;">Best regards,</p>
        <p style="margin: 0; font-weight: bold; color: #0369A0;">TPO Dev Team</p>
        <p style="margin-top: 8px; font-size: 12px; color: #999;">
          This is an automated message. Please do not reply to this email.
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

export const verifyResetPasswordOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user =await Outsider.findOne({email});

  if (!user)
    return res.status(401).json({ message: "Email is not registered" });

  const otpVerification = await OtpVerificationOutsider.findOne({ email });

  if (!otpVerification || !otpVerification.otp) {
    return res.status(400).json({ message: "OTP not requested" });
  }
  if (otpVerification.otpAttempts >= 5) {
    return res.status(400).json({ message: "Too many wrong attempts." });
  }

  if (Date.now() > otpVerification.otpExpires) {
    return res.status(400).json({ message: "OTP has expired" });
  }

  if (otpVerification.otp !== otp) {
    otpVerification.otpAttempts += 1;
    await OtpVerificationOutsider.save();
    return res.status(400).json({ message: "Invalid OTP" });
  }

  await OtpVerificationOutsider.deleteOne({ email });

  const resetId = uuidv4();

  await ResetPasswordTokenOutsider.findOneAndUpdate(
    { email },
    {
      email,
      resetId,
      timestamp: new Date(),
    },
    { upsert: true, new: true }
  );

  const resetPasswordtoken = jwt.sign(
    { email, resetId },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );
  res.cookie("resetPasswordToken", resetPasswordtoken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  res.status(200).json({ message: "OTP verified successfully" });
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const resetPasswordToken = req.cookies?.resetPasswordToken;
  if (!resetPasswordToken) {
    return res.status(401).json({ message: "Reset Token not found" });
  }
  try {
    const decoded = jwt.verify(resetPasswordToken, process.env.JWT_SECRET);
    if (!decoded || decoded.email !== email) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const resetpasswordData = await ResetPasswordTokenOutsider.findOne({ email });
    if (!resetpasswordData) {
      return res.status(401).json({ message: "Invalid request" });
    }
    if (decoded.resetId !== resetpasswordData.resetId) {
      return res.status(401).json({ message: "Reset Token expired" });
    }

    const user=await Outsider.findOne({email});

    if (!user) {
      return res.status(401).json({ message: "Email is not Registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.clearCookie("resetPasswordToken");
    await ResetPasswordTokenOutsider.deleteOne({ email });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Invalid Token" });
  }
};