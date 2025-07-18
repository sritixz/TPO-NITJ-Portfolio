import Recuiter from "../models/user_model/recuiter.js";
import Professor from "../models/user_model/professor.js";
import Student from "../models/user_model/student.js";
import Alumni from "../models/user_model/alumni.js";
import Admin from "../models/user_model/admin.js";
import Department from "../models/user_model/department.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import LoginAttempt from "../models/loginattempt.js";
import OtpVerification from "../models/OtpVerification.js";
import ResetPasswordToken from "../models/resetpassword.js";
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';

// const generateOTP = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString();
//   };

const generateOTP = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return otp;
};

  export const sendResetPasswordOtp = async (req, res) => {
    const { email } = req.body;
    const user = await Student.findOne({ email }) ||
               await Recuiter.findOne({ email }) ||
               await Professor.findOne({ email }) ||
               await Alumni.findOne({ email }) ||
               await Admin.findOne({ email });

   if (!user) return res.status(401).json({ message: "Email is not registered" });
     const expiry = new Date(Date.now() + 5 * 60 * 1000);
     const otp = generateOTP();

    await OtpVerification.findOneAndUpdate(
    { email },
    {
      email,
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
      subject: "Password Reset Request",
      html: `<div style="font-family: Arial, sans-serif; color: #333;">
    <p>Dear User,</p>
    <p><strong>Your OTP to reset your password is:</strong> <span style="font-size: 1.5em; color: #007bff;">${otp}</span></p>
    <p>If you didn’t request this, you can safely ignore this email.</p>
    <p>Best regards,<br/>TPO Dev Team</p>
  </div>`,
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

  export const verifyResetPasswordOtp =async (req, res) => {
    const { email, otp } = req.body;
    const user = await Student.findOne({ email }) ||
               await Recuiter.findOne({ email }) ||
               await Professor.findOne({ email }) ||
               await Alumni.findOne({ email }) ||
               await Admin.findOne({ email });

    if (!user) return res.status(401).json({ message: "Email is not registered" });

    const otpVerification = await OtpVerification.findOne({ email });

    if (!otpVerification || !otpVerification.otp) {
      return res.status(400).json({ message: "OTP not requested" });
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

    await OtpVerification.deleteOne({ email });

    const resetId = uuidv4();

    await ResetPasswordToken.findOneAndUpdate(
      { email },
      {
        email,
        resetId,
        timestamp: new Date(),
      },
      { upsert: true, new: true }
    );

    const resetPasswordtoken= jwt.sign({ email,resetId }, process.env.JWT_SECRET, { expiresIn: '10m' });
    res.cookie("resetPasswordToken", resetPasswordtoken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    res.status(200).json({ message: "OTP verified successfully" });
  };

export const LockedResendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const loginAttempt = await LoginAttempt.findOne({ email });
        if (!loginAttempt || !loginAttempt.isLocked) {
            return res.status(400).json({ message: "Invalid request" });
        }
        if(Date.now() < loginAttempt.otpExpires){
         return res.status(400).json({ message: "Please wait for the current OTP to expire before requesting a new one." });
         }
        // const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const newOTP = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        loginAttempt.otp = newOTP;
        loginAttempt.otpExpires = otpExpires;
        loginAttempt.otpAttempts = 0;
        await loginAttempt.save();
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
              subject: 'Security OTP for Account Unlock',
              html: `<p>Dear User,</p>
  <p><strong>Your new OTP to unlock your account is:</strong> <span style="font-size: 1.2em;">${newOTP}</span></p>
  <p>Please do not share this code with anyone.</p>
  <p>Thank you,<br/>TPO Dev Team</p>`,
          };
          await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "New OTP sent" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

  export const LockedverifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const loginAttempt = await LoginAttempt.findOne({ email });

        if (!loginAttempt || !loginAttempt.isLocked) {
            return res.status(401).json({ message: "Invalid request" });
        }

        if (loginAttempt.otpAttempts >= 5) {
            return res.status(401).json({ message: "Too many wrong attempts." });
        }

        if (Date.now() > loginAttempt.otpExpires) {
            return res.status(401).json({ message: "OTP has expired" });
        }

        if (loginAttempt.otp !== otp) {
            loginAttempt.otpAttempts +=1 ;
            return res.status(401).json({ message: "Invalid OTP" });
        }

        loginAttempt.isLocked = false;
        loginAttempt.loginAttempts = 0;
        loginAttempt.otp = null;
        loginAttempt.otpExpires = null;
        loginAttempt.otpAttempts = 0;
        loginAttempt.ip = null;
        await loginAttempt.save();

        res.status(200).json({ message: "Account unlocked. Please login again." });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

  export const resetPassword =async (req, res) => {
    const { email, newPassword } = req.body;
    const resetPasswordToken = req.cookies?.resetPasswordToken;
    if (!resetPasswordToken) {
        return res.status(401).json({ message: "Reset Token not found" });
    }
    try{
    const decoded = jwt.verify(resetPasswordToken, process.env.JWT_SECRET);
    if (!decoded || decoded.email !== email) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const resetpasswordData = await ResetPasswordToken.findOne({ email });
    if (!resetpasswordData) {
        return res.status(401).json({ message: "Invalid request" });
    }
    if (decoded.resetId !== resetpasswordData.resetId) {
        return res.status(401).json({ message: "Reset Token expired" });
    }

    const student = await Student.findOne({ email });
    const recuiter = await Recuiter.findOne({ email });
    const professor = await Professor.findOne({ email });
    const alumni = await Alumni.findOne({ email });
    const admin = await Admin.findOne({ email });

    if (!student && !recuiter && !professor && !alumni && !admin) {
        return res.status(401).json({ message: "Email is not Registered" });
    }

    const user = student || recuiter || professor || alumni || admin;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.clearCookie("resetPasswordToken");
    await ResetPasswordToken.deleteOne({ email });

    res.status(200).json({ message: "Password reset successfully" });

    }catch(error){
        res.status(500).json({ message: "Invalid Token" });
    }
  };
  
   export const login = async (req, res) => {
      
      const { email, password,captchaInput } = req.body;
      const captchaToken = req.cookies.captchaToken;

       if (!captchaToken) {
          console.error("CAPTCHA token missing");
          return res.status(400).json({ success: false, error: "CAPTCHA token missing" });
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
         if (!decoded.verified || decoded.expires < Date.now() || decoded.attempts >= decoded.maxAttempts) {
         res.clearCookie("captchaToken");
         return res.status(400).json({ success: false, error: "Invalid or expired CAPTCHA" });
         }

        if (decoded.text !== captchaInput) {
        res.clearCookie("captchaToken");
        return res.status(400).json({ success: false, error: "CAPTCHA not verified" });
         }
          let loginAttempt = await LoginAttempt.findOne({ email });
          if (loginAttempt && loginAttempt.isLocked) {
              if(Date.now() > loginAttempt.otpExpires){
                    const mailOptions = {
                      from: process.env.EMAIL_USER,
                      to: email,
                      subject: 'Security OTP for Account Unlock',
                      html: `<p>Dear User,</p>
  <p><strong>Your OTP to unlock your account is:</strong> <span style="font-size: 1.2em;">${otp}</span></p>
  <p>Please do not share this code with anyone.</p>
  <p>Thank you,<br/>TPO Dev Team</p>`,
                  };
                  await transporter.sendMail(mailOptions);
              }
              return res.status(400).json({ message: "Account locked. Please check your email for OTP." });
          }
          const student = await Student.findOne({ email });
          const recuiter = await Recuiter.findOne({ email });
          const professor = await Professor.findOne({ email });
          const alumni = await Alumni.findOne({ email });
          const admin = await Admin.findOne({ email });
          const department = await Department.findOne({ email });
  
          if (!student && !recuiter && !professor && !alumni && !admin && !department) {
              return res.status(401).json({ message: "Email is not Registered" });
          }
  
          const user = student || recuiter || professor || alumni || admin || department;
  
          let isPasswordValid;
          if (user.password.startsWith('$2')) {
              isPasswordValid = await bcrypt.compare(password, user.password);
          } else {
              isPasswordValid = password === user.password;
              const salt = await bcrypt.genSalt(10);
              const hashedPassword = await bcrypt.hash(password, salt);
              await user.updateOne({ password: hashedPassword });
          }
  
          if (!isPasswordValid) {
              if (!loginAttempt) {
                  loginAttempt = new LoginAttempt({ email, loginAttempts: 1 });
              } else {
                  loginAttempt.loginAttempts += 1;
              }
              if(loginAttempt.loginAttempts==3){
                   const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                   const mailOptions = {
                      from: process.env.EMAIL_USER,
                      to: email,
                      subject: 'Alert: Suspicious Login Attempts Detected',
                       html: `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #d9534f;">🔒 Alert: Suspicious Login Attempts Detected</h2>
    <p>We noticed <strong>3 unsuccessful login attempts</strong> on your account.</p>
    <p><strong>IP Address:</strong> ${ip}</p>
    <p>If this wasn't you, we strongly recommend you <strong>change your password</strong> immediately.</p>
    <p>Stay safe,<br/>TPO Dev Team</p>
  </div>`,
                  };
                  await transporter.sendMail(mailOptions);
              }
              if (loginAttempt.loginAttempts >= 7) {
                  const ip= req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                  loginAttempt.isLocked = true;
                //   const otp = Math.floor(100000 + Math.random() * 900000).toString();
                  const otp = generateOTP();
                  loginAttempt.otp = otp;
                  loginAttempt.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
                  loginAttempt.ip = ip;
                  const mailOptions = {
                      from: process.env.EMAIL_USER,
                      to: email,
                      subject: 'Security OTP for Account Unlock',
                      html: `<p>Dear User,</p>
  <p>For security reasons, we have temporarily locked your account for 24 hours due to multiple unauthorized access attempts.</p>
  <p><strong>Your OTP to unlock your account is:</strong> <span style="font-size: 1.2em;">${otp}</span></p>
  <p>Please do not share this code with anyone.</p>
  <p>Thank you,<br/>TPO Dev Team</p>`,
                  };
                  await transporter.sendMail(mailOptions);
              }
  
              await loginAttempt.save();
              return res.status(401).json({ message: "Invalid password" });
          }
  
          if (loginAttempt) {
              await LoginAttempt.deleteOne({ email });
          }
  
          let userType = "";
          if (user == student) userType = "Student";
          else if (user == recuiter) userType = "Recuiter";
          else if (user == professor) userType = "Professor";
          else if (user == alumni) userType = "Alumni";
          else if (user == admin) userType = "Admin";
          else if (user == department) userType = "Department";
  
          const token = jwt.sign({ userId: user._id, userType: userType }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
          if (!token) {
              return res.status(500).json({ message: "Failed to generate token" });
          }
   
          res.cookie("token", token, {
              httpOnly: true,
              sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
              secure: process.env.NODE_ENV === "production",
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
          if (userType === "Student" && student) {
            try {
                const rollNumbers = [student.rollno];
                const course = student.course;
                const response = await axios.post(`${process.env.ERP_SERVER}`, rollNumbers, {
                    });
                const erpStudents = response.data.data;
                const erpData = erpStudents[0];
                const erpBatch = erpData.batch;
                const courseDurations = {
                "B.Tech": 4,
                "M.Tech": 2,
                "B.Sc.-B.Ed.": 4,
                "MBA": 2,
                "M.Sc.": 2
                };
               const adjustment = courseDurations[course] || 0; // Default to 0 if course not found
               const adjustedBatch = String(Number(erpBatch) + adjustment);
                const updatedStudent = await Student.findByIdAndUpdate(
                    student._id,
                    {
                        cgpa: erpData.cgpa,
                        batch: adjustedBatch,
                        active_backlogs: erpData.active_backlogs === 'true',
                        backlogs_history: erpData.backlogs_history === 'true'
                    },
                    { new: true }
                );     
                res.clearCookie("captchaToken");
                return res.status(200).json({ message: "Login Successful",  user: updatedStudent, userType });
            } catch (error) {
                console.error("Error fetching ERP data:", error);
                return res.status(500).json({ message: "Login Successful, but failed to fetch ERP data", user, userType });
            }
        }
          res.clearCookie("captchaToken");
          res.status(200).json({ message: "Login Successful", user: user, userType: userType });
      } catch (error) {
            console.error("Error in login route:", error); 
          res.clearCookie("captchaToken");
          res.status(500).json({ message: "Internal Server Error" });
      }
  };
  
//   export const login = async (req, res) => {
//       try {
//          console.log("hello from login");
//           const { email, password/* code */ } = req.body;
//           let loginAttempt = await LoginAttempt.findOne({ email });
//           if (loginAttempt && loginAttempt.isLocked) {
//               return res.status(400).json({ message: "Account locked. Please check your email for OTP." });
//           }
//           const student = await Student.findOne({ email });
//           const recuiter = await Recuiter.findOne({ email });
//           const professor = await Professor.findOne({ email });
//           const alumni = await Alumni.findOne({ email });
//           const admin = await Admin.findOne({ email });
//           const department = await Department.findOne({ email });
  
//           if (!student && !recuiter && !professor && !alumni && !admin && !department) {
//               return res.status(401).json({ message: "Email is not Registered" });
//           }
  
//           const user = student || recuiter || professor || alumni || admin || department;
  
//           let isPasswordValid;
//           if (user.password.startsWith('$2')) {
//               isPasswordValid = await bcrypt.compare(password, user.password);
//           } else {
//               isPasswordValid = password === user.password;
//               const salt = await bcrypt.genSalt(10);
//               const hashedPassword = await bcrypt.hash(password, salt);
//               await user.updateOne({ password: hashedPassword });
//           }
  
//           if (!isPasswordValid) {
//               if (!loginAttempt) {
//                   loginAttempt = new LoginAttempt({ email, loginAttempts: 1 });
//               } else {
//                   loginAttempt.loginAttempts += 1;
//               }
//               if (loginAttempt.loginAttempts >= 10) {
//                   loginAttempt.isLocked = true;
//                   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//                   loginAttempt.otp = otp;
//                   loginAttempt.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
//                   const transporter = nodemailer.createTransport({
//                     service: "gmail",
//                     auth: {
//                       user: process.env.EMAIL_USER,
//                       pass: process.env.EMAIL_PASS,
//                     },
//                   });
//                   const mailOptions = {
//                       from: process.env.EMAIL_USER,
//                       to: email,
//                       subject: 'Security OTP for Account Unlock',
//                       text: `Your OTP for account unlock is: ${otp}`,
//                   };
  
//                   console.log("will send mail now");
//                   await transporter.sendMail(mailOptions);
//                   console.log("mail sent");
//               }
  
//               await loginAttempt.save();
//               return res.status(401).json({ message: "Invalid password" });
//           }
  
//           if (loginAttempt) {
//               await LoginAttempt.deleteOne({ email });
//           }
  
//           let userType = "";
//           if (user == student) userType = "Student";
//           else if (user == recuiter) userType = "Recuiter";
//           else if (user == professor) userType = "Professor";
//           else if (user == alumni) userType = "Alumni";
//           else if (user == admin) userType = "Admin";
//           else if (user == department) userType = "Department";
  
//           const token = jwt.sign({ userId: user._id, userType: userType }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
//           if (!token) {
//               return res.status(500).json({ message: "Failed to generate token" });
//           }
   
//           res.cookie("token", token, {
//               httpOnly: true,
//               sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
//               secure: process.env.NODE_ENV === "production",
//               expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//           });
//         console.log("hello");
//           if (userType === "Student" && student) {
//             try {
//                 const rollNumbers = [student.rollno];
//                 const course = student.course;
//                 const response = await axios.post(`${process.env.ERP_SERVER}`, rollNumbers, {
//                     });
//                 const erpStudents = response.data.data;
//                 const erpData = erpStudents[0];
//                 const erpBatch = erpData.batch;
//                 const courseDurations = {
//                 "B.Tech": 4,
//                 "M.Tech": 2,
//                 "B.Sc.-B.Ed.": 4,
//                 "MBA": 2,
//                 "M.Sc.": 2
//                 };
//                const adjustment = courseDurations[course] || 0; // Default to 0 if course not found
//                const adjustedBatch = String(Number(erpBatch) + adjustment);
//                 const updatedStudent = await Student.findByIdAndUpdate(
//                     student._id,
//                     {
//                         cgpa: erpData.cgpa,
//                         batch: adjustedBatch,
//                         active_backlogs: erpData.active_backlogs === 'true',
//                         backlogs_history: erpData.backlogs_history === 'true'
//                     },
//                     { new: true }
//                 );
               

//                 return res.status(200).json({ message: "Login Successful",  user: updatedStudent, userType });
//             } catch (error) {
//                 console.error("Error fetching ERP data:", error);
//                 return res.status(500).json({ message: "Login Successful, but failed to fetch ERP data", user, userType });
//             }
//         }
//           res.status(200).json({ message: "Login Successful", user: user, userType: userType });
//       } catch (error) {
//           res.status(500).json({ message: "Internal Server Error" });
//       }
//   };

export const logout = (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0), path: '/' });
    res.status(200).json({ message: 'Logged out successfully' });
  }