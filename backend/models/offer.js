import mongoose from "mongoose";

const OfferSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobProfile",
    },
    company_name: {
      type: String,
    },
    batch:{
        type:String,
    },
    course: {
      type:String,
    },
    offer_mode:{
      type:String,
      default:'On-Campus',
    },
    offer_sector:{
      type:String,
      default:'Private'
   },
    result_date: {
      type: Date,
    },
    shortlisted_students: [
      {
        studentId:{
          type:mongoose.Schema.Types.ObjectId,
          ref:'Student'
        },
        name: {
          type: String,
          required: true,
        },
        gender:{
          type:String,
          enum:['Male','Female','Other']
        },
        department: {
          type: String,
        },
        category:{
          type:String,
        },
        job_type:{
           type:String,
        },
        job_role:{
            type:String,
        },
        ctc:{
            type:String,
        },
        stipend:{
            type:String,
        },
        intern_duration:{
            type:String,
        },
      }
    ],
    visibility: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offer", OfferSchema);
export default Offer;