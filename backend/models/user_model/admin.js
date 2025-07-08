import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: String,
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

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
