import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  url:{ type: String, default: null },
  deviceInfo:{
    browser: String,
    os: String,
    deviceType: String,
    screenResolution: String },
  ip:{type: String},
  userAgent: {type: String},
  timestamp: { type: Date, default: Date.now },
});

LogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 9000});

export default mongoose.model("Logs", LogSchema);
