// models/ApplicationDeadline.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  type: { type: String, required: true }, // Internship / Placement
  deadline: { type: Date, required: true }
});

export default mongoose.model("ApplicationDeadline", schema);