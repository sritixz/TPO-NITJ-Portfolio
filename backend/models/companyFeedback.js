import mongoose from "mongoose";

const ratingSchema = {
  type: Number,
  min: 1,
  max: 5,
};

const recruitmentFeedbackSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
    },
    recruiterNames: {
      type: [String], 
    },
    email: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    modeOfRecruitment: {
      type: String,
    },

    programsVisited: {
      type: [String], 
    },
    studentEvaluation: {
      technicalKnowledge: ratingSchema,
      problemSolvingSkills: ratingSchema,
      programmingOrCoreSkills: ratingSchema,
      communicationSkills: ratingSchema,
    },

    infrastructureFeedback: {
      recruitmentFacilities: ratingSchema,
      itSupport: ratingSchema,
    },
    stayAndHospitalityFeedback: {
      guestHouseAccomodation: ratingSchema,
      cleanlinessAndComfort: ratingSchema,
      foodAndMealQuality: ratingSchema,
      hospitalityAndSupportStaff: ratingSchema
    },
    strengthsObserved: {
      type: String,
    },
    skillGapsObserved: {
      type: String,
    },
    suggestionsForImprovement: {
      type: String,
    },
    suggestionsForSpecificDepartment: {
      type: String,
    },
    revisitNITJalandhar: {
      type: String,
    },
    interestedInCollaboration: {
      type: Boolean,
      default: false,
    },
    overallRating: ratingSchema,
    additionalRemarks: {
      type: String,
    },
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model(
  "companyFeedback",
  recruitmentFeedbackSchema
);
