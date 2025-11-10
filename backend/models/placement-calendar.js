import mongoose from "mongoose";

const companyProcessSchema = new mongoose.Schema({
  company: { type: String, required: true },
  process: { type: String, required: true },
  timeIn: { type: String },
  timeOut: { type: String },
  visitStatus: { type: String },
  status: { type: String },
  branches: { type: String },
  ctc: { type: String }
});

const placementCalendarSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  dayStatus: { type: String },  //exam week, holiday, winter vacation
  companies: [companyProcessSchema]
}, { timestamps: true });

const PlacementCalendar = mongoose.model("PlacementCalendar", placementCalendarSchema);

export default PlacementCalendar;
