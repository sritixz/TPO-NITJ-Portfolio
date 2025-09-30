import mongoose from "mongoose";

const InsightSchema = new mongoose.Schema(
  {
    course: {
      type: String,
    },
    batch: {    // current batch for this course
      type: String,
    },
    type: {     // placement or summer internship
      type: String,
      default: "Placement",
    },
    goal:[{
     type:{    // Tech or Non-Tech
       type: String
     },
     target:{       //no. of companies will visit
       type: String
     },
     deadline:{
       type: String
     }
    }]
},
  { timestamps: true },
);

const Insight = mongoose.model("Insight", InsightSchema);
export default Insight;