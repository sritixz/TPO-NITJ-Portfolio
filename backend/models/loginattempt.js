import mongoose from "mongoose";

const loginAttemptSchema = new mongoose.Schema({
    email: { type: String },
    isLocked: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    otp: { type: String, default: null },
    otpExpires: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    ip: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
});

loginAttemptSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400});

const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);
export default LoginAttempt;