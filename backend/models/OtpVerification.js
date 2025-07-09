import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String },
  otpExpires: { type: Date },
  otpVerified: { type: Boolean, default: false },
  otpAttempts: { type: Number, default: 0 },
  otpBlockedUntil: { type: Date }
});

export default mongoose.model("OtpVerification", otpVerificationSchema);
