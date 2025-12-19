import mongoose from "mongoose";

const lte2monthDeadlineSchema = new mongoose.Schema({
    deadline: {
        type: Date,
    },
}, {
  timestamps: true
});

const lte2monthDeadline = mongoose.model('lte2monthDeadline', lte2monthDeadlineSchema);

export default lte2monthDeadline;