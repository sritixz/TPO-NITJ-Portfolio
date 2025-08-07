import mongoose from "mongoose";

const placementRegistrationSchema = new mongoose.Schema({
  studentId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  name: {
    type: String,
  },
  rollno: {
    type: String,
  },
  department: {
    type: String,
  },
  course: {
    type: String,
  },
  batch:{
    type: String,
  },
  fatherName: {
    type: String,
  },
  motherName: {
    type: String,
  },
  category: {
    type: String,
  },
  gender: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  physicallyDisabled: {
    type: Boolean,
  },
  disabilityType: {
    type: String,
  },
  permanentAddress: {
    type: String,
  },
  mobileNo: {
    type: String,
  },
  emailNitj: {
    type: String,
  },
  emailPersonal: {
    type: String,
  },
  aadharCardNo: {
    type: String,
  },
  interested: {
    type: Boolean,
  },
  description: {
    type: String,
  },
}, {
  timestamps: true
});

const PlacementRegistration = mongoose.model('PlacementRegistration', placementRegistrationSchema);

export default PlacementRegistration;