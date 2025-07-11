import mongoose from "mongoose";

const resetpasswordTokenSchema = new mongoose.Schema({
  email: { type: String},
  resetId:{ type: String, default: null },
  timestamp: { type: Date, default: Date.now },
});

resetpasswordTokenSchema.index({ timestamp: 1 }, { expireAfterSeconds: 9000});

export default mongoose.model("ResetPasswordToken", resetpasswordTokenSchema);
