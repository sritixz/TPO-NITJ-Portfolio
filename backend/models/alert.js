import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    showOnLoad: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now, // optional scheduling
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);
