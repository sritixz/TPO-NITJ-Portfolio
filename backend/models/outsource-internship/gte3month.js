// models/outsource-internship/ltemorethan3month.js
import mongoose from "mongoose";

const ltemorethan3monthInternshipSchema = new mongoose.Schema({
  applicantId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Outsider",
  },
  homeUniversityName: {
    type: String,
  },
  homeUniversityAddress: {
    type: String,
  },
  durationFrom: {
    type: Date,
  },
  durationTo: {
    type: Date,
  },
  nonDegreeActivities: {
    type: String,
  },
  internshipType: {
    type: String,
  },
  ApplicantName: {
    type: String,
  },
  fathersName: {
    type: String,
  },
  mothersName: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  birthCity: {
    type: String,
  },
  birthCountry: {
    type: String,
  },
  maritalStatus: {
    type: String,
  },
  nationality: {
    type: String,
  },
  passportNo: {
    type: String,
  },
  passportIssueDate: {
    type: String,
  },
  passportIssuePlace: {
    type: String,
  },
  passportValidUpTo: {
    type: String,
  },
  correspondenceAddress: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  hostelNeeded: {
    type: Boolean,
  },
  facultySupervisor: {
    type: String
  },
  facultySupervisorDepartment: {
    type: String
  },
  department: {
    type: String,
  },
  degree: {
    type: String,
  },
  academicYear: {
    type: String,
  },
  academicSemester: {
    type: String,
  },
  languagesKnown: {
    type: [String],
    default: []
  },
   declarationAccepted: {
    type: Boolean,
  },
  photo: {
    type: String
  },
  signature: {
    type: String
  },
  documents: {
    type: String
  },
  locked: {
    type: Boolean,
    default: false
  },
  status:{
    type: String,
  }
}, {
  timestamps: true
});

const LongTermInternshipApplication = mongoose.model('LongTermInternshipApplication', ltemorethan3monthInternshipSchema);

export default LongTermInternshipApplication;