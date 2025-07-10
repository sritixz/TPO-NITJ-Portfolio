import mongoose from "mongoose";

const SummerInternTrackerSchema = new mongoose.Schema(
  {
   batch:{
      type: String,
   },
   course:{
      type: String,
   },
   studentsId:[{
       type: mongoose.Schema.Types.ObjectId,
       ref: "Student",
    }]
  },
  { timestamps: true }
);

const SummerInternTracker = mongoose.model("SummerInternTracker", SummerInternTrackerSchema);

export default SummerInternTracker;
