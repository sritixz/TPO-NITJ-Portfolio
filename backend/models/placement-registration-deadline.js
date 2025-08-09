import mongoose from "mongoose";

const placementRegistrationDeadlineSchema = new mongoose.Schema({
    allowed:{
        type: Boolean,
        default: false,
    },
    deadlinetoshow: {
        type: Date,
    },
}, {
  timestamps: true
});

const PlacementRegistrationDeadline = mongoose.model('PlacementRegistrationDeadline', placementRegistrationDeadlineSchema);

export default PlacementRegistrationDeadline;