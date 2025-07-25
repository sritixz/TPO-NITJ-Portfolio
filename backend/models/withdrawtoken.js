import mongoose from "mongoose";

const withdrawTokenSchema = new mongoose.Schema({
  studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  jobId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobProfile",
  },
  withdrawId:{ type: String, default: null },
  timestamp: { type: Date, default: Date.now },
});

withdrawTokenSchema.index({ timestamp: 1 }, { expireAfterSeconds: 9000});

export default mongoose.model("WithdrawToken", withdrawTokenSchema);
