import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    totalOffers: {
      type: Number,
      required: true,
    },

    acceptedCompany: {
      type: String,
      required: true,
    },
    linkedin: {
      type: String,
      required: false,
    },

    offerLetter: {
      type: String, // store file URL (Cloudinary / S3)
      required: true,
    },
    hrName: String,
    hrEmail: String,
    ctc: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const OfferLetter = mongoose.model("OfferLetter", offerSchema);

export default OfferLetter;
