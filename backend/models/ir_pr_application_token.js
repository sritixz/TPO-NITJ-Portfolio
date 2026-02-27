import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

// auto delete when expired
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("ApplicationToken", tokenSchema);