import companyFeedback from "../models/companyFeedback.js";

export const getAllCompanyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await companyFeedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCompanyFeedback = async (req, res) => {
  const body = req.body;
  try {
    const newFeedbacks = new companyFeedback(body);
    await newFeedbacks.save();
    res.status(200).json(newFeedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCompanyFeedback = async (req, res) => {
  const { id } = req.params;
  try {
    await companyFeedback.findByIdAndDelete(id);
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(400).json({message: error.message})
  }
};
