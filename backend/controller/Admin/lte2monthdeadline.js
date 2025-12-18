import lte2monthDeadline from "../../models/outsource-internship/lte2monthdeadline.js";

export const createDeadline = async (req, res) => {
  try {
    const { deadline } = req.body;

    if (!deadline) {
      return res.status(400).json({ message: "Deadline is required" });
    }

    const newDeadline = await lte2monthDeadline.create({ deadline });

    res.status(201).json({
      success: true,
      message: "Deadline created successfully",
      data: newDeadline,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating deadline",
      error: error.message,
    });
  }
};

export const getDeadlineById = async (req, res) => {
  try {
    const { id } = req.params;

    const deadline = await lte2monthDeadline.findById(id);

    if (!deadline) {
      return res.status(404).json({ message: "Deadline not found" });
    }

    res.status(200).json({
      success: true,
      data: deadline,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching deadline",
      error: error.message,
    });
  }
};

export const updateDeadline = async (req, res) => {
  try {
    const { id } = req.params;
    const { deadline } = req.body;

    const updatedDeadline = await lte2monthDeadline.findByIdAndUpdate(
      id,
      { deadline },
      { new: true, runValidators: true }
    );

    if (!updatedDeadline) {
      return res.status(404).json({ message: "Deadline not found" });
    }

    res.status(200).json({
      success: true,
      message: "Deadline updated successfully",
      data: updatedDeadline,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating deadline",
      error: error.message,
    });
  }
};

export const deleteDeadline = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDeadline = await lte2monthDeadline.findByIdAndDelete(id);

    if (!deletedDeadline) {
      return res.status(404).json({ message: "Deadline not found" });
    }

    res.status(200).json({
      success: true,
      message: "Deadline deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting deadline",
      error: error.message,
    });
  }
};
