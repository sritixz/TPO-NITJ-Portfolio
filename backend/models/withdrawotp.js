import mongoose from "mongoose";

const withdrawotpVerificationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  jobId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobProfile",
  },
  otp: { type: String, default: null },
  otpExpires: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  ip: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
});

withdrawotpVerificationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 18000});

export default mongoose.model("withdrawOtpVerification", withdrawotpVerificationSchema);
