import mongoose from "mongoose";

const educationQualificationSchema = new mongoose.Schema({
  semester: {
    type: String,
    enum: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6']
  },
  yearOfPassing: {
    type: String,
  },
  percentageOrSGPA: {
    type: String,
  },
});

const lte2monthInternshipSchema = new mongoose.Schema({
  departmentAppliedFor: {
    type: String,
  },
  proposedFacultyMember: {
    type: String,
  },
  proposedFacultyMemberEmail: {
    type: String,
  },
  proposedFacultyMemberContact:{
    type: String,
  },
  name: {
    type: String,
  },
  institution: {
    type: String,
  },
  presentSemester: {
    type: String,
  },
  branch: {
    type: String,
  },
  course:{
    type: String,
  },
  postalAddress: {
    type: String,
  },
  permanentAddress: {
    type: String,
  },
  mobileNo: {
    type: String,
  },
  email: {
    type: String,

  },
  fathersName: {
    type: String,
  },
  gender: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  nationality: {
    type: String,
  },
  educationQualifications: [educationQualificationSchema],
  overallCGPA: {
    type: String,
  },
  declarationAccepted: {
    type: Boolean,
  },
  photo: {
    type: String,
  },
  signature: {
    type: String,
  },
  documents: {
    type: String,
  },
  locked: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

const lte2monthInternship = mongoose.model('InternshipApplication', lte2monthInternshipSchema);

export default lte2monthInternship;