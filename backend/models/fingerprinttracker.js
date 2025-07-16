import mongoose from "mongoose";

const fingerprintTrackingSchema = new mongoose.Schema({
  fingerprint: {type:String},
  requestCount: {type:Number},
  ip: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
});

fingerprintTrackingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 18000});

export default mongoose.model("FingerprintTracker", fingerprintTrackingSchema);
