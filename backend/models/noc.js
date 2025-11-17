import mongoose from "mongoose";

const NOCSchema = new mongoose.Schema({
  studentId: { type: String },
  nocId: { type: String},
  companyName: { type: String },
  dateSubmitted: { type: Date},
  respondentEmail: { type: String },
  salutation: { type: String },
  studentName: { type: String },
  rollNo: { type: String },
  batch: { type: String },
  course: {type: String,}, 
  year: {type: String,},
  semester: {type: String,},
  department: {type: String,},
  internshipFrom: { type: Date},
  internshipTo: { type: Date },
  internshipDuration: {type: String,},
  internshipMode: {type: String,},
  contactPersonName: { type: String},
  contactPersonDesignation: { type: String },
  contactPersonPhone: { type: String },
  contactPersonEmail: { type: String },
  offerLetter: { type: String },
  turnoverReport: { type: String },
  mailScreenshot: { type: String },
  nocStatus: { type: String, default: 'Pending' },
  nocLetter: { type: String },
}, { timestamps: true });

const NOC = mongoose.model('NOC', NOCSchema);
export default NOC;
