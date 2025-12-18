import mongoose from "mongoose";

const outsiderTokenSchema = new mongoose.Schema({
  email: { type: String},
  verificationId:{ type: String, default: null },
  timestamp: { type: Date, default: Date.now },
});

outsiderTokenSchema.index({ timestamp: 1 }, { expireAfterSeconds: 9000});

export default mongoose.model("OutsiderToken",outsiderTokenSchema);
