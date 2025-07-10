import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema({
  email: { type: String},
  otp: { type: String, default: null },
  otpExpires: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  ip: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
});

otpVerificationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 18000});

export default mongoose.model("OtpVerification", otpVerificationSchema);
