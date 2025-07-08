import mongoose from "mongoose";

const professorSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  otp:{
   type:String
  },
  otpExpires: {
    type:Date
  },
  otpVerified: { 
    type: Boolean, default: false 
  },
}, { timestamps: true });

const Professor = mongoose.model('Professor', professorSchema);

export default Professor;
