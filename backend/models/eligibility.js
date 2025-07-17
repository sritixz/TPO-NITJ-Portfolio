import mongoose from "mongoose";

const JobEligibilitySchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobProfile",
    },
   studentId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
   },
   eligible:{
    type: Boolean,
    default: false,
   }},
  { timestamps: true },
);

JobEligibilitySchema.index({ updatedAt: 1 }, { expireAfterSeconds: 1200 });

const JobEligibility = mongoose.model("JobEligibility", JobEligibilitySchema);
export default JobEligibility;