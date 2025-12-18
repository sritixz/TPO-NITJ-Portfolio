import mongoose from "mongoose";

const outsiderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },

    contact: {
      type: String,
    },

    email: {
      type: String,
    },
    collegeName: {
      type: String,
    },

    collegeRollNo: {
      type: String,
    },

    password: {
      type: String,
    },

    gender: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Outsider", outsiderSchema);
