import mongoose from "mongoose";

const recuiterSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  company: {
    type: String,
  },
  designation: {
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

const Recuiter = mongoose.model('Recuiter', recuiterSchema);

export default Recuiter;
