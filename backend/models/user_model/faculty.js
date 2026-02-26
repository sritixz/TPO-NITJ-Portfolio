import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  otp: {
    type: String
  },
}, { timestamps: true });

const Faculty = mongoose.model('Faculty', facultySchema);

export default Faculty;