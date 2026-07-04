import mongoose from "mongoose";

const OfferTrackerSchema = new mongoose.Schema(
  {
   studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    offer:[{
        offer_type:{
            type:String,
        },
        offer_category:{
            type:String,
        },
        offer_sector:{
            type:String,
            default:'Private'
        },
        offer_ctc:{
            type:String,
            default:'0',
        },
        offer_intern_duration:{
            type:String,
        },
        offer_job_category:{
            type:String,
        },
        isCountable:{
            type:Boolean,
            default:true,
        },
        isDream:{
            type:Boolean,
            default:false,
        },
        placementPhase:{
            type:String,
            enum:['I','II'],
        },
        jobId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobProfile",
        },
    }]
  },
  { timestamps: true }
);

const OfferTracker = mongoose.model("OfferTracker", OfferTrackerSchema);

export default OfferTracker;
