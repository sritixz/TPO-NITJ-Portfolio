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
    }]
  },
  { timestamps: true }
);

const OfferTracker = mongoose.model("OfferTracker", OfferTrackerSchema);

export default OfferTracker;
