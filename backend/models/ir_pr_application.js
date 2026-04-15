import mongoose from "mongoose";

const representativeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    type: {
      type: String,
    },
    batch: String,
    branch: String,
    course: String,
    activities: [
      {
        description: String,
        role: String,
        duration: String,
      },
    ],
    sop: String,

    status: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
    },
    declarationAccepted: {
      type: Boolean,
    },
semester: {
  type: Number,
}
  },
  { timestamps: true },
);

representativeSchema.index({ student: 1, type: 1 }, { unique: true });

export default mongoose.model(
  "RepresentativeApplication",
  representativeSchema,
);
