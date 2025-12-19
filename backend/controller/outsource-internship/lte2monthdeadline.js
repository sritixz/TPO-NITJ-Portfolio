import lte2monthDeadline from "../../models/outsource-internship/lte2monthdeadline.js";


export const upsertLte2MonthDeadline = async (req, res) => {
  try {
    const { deadline } = req.body;

    if (!deadline) {
      return res.status(400).json({
        success: false,
        message: "Deadline is required",
      });
    }

    let existing = await lte2monthDeadline.findOne();

    if (existing) {
      // Update existing entry
      existing.deadline = deadline;
      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Deadline updated successfully",
        data: existing,
      });
    }

    // Create if not exists
    const newDeadline = await lte2monthDeadline.create({ deadline });

    return res.status(201).json({
      success: true,
      message: "Deadline created successfully",
      data: newDeadline,
    });

  } catch (error) {
    console.error("Deadline upsert error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const checkLte2MonthStatus = async (req, res) => {
  try {
    const entry = await lte2monthDeadline.findOne();

    // If no deadline set yet → CLOSED
    if (!entry || !entry.deadline) {
      return res.status(200).json({
        success: true,
        status: "CLOSED",
        isOpen: false,
        message: "Deadline not set",
      });
    }

    const now = new Date();
    const deadlineDate = new Date(entry.deadline);

    const isOpen = now <= deadlineDate;

    return res.status(200).json({
      success: true,
      status: isOpen ? "OPEN" : "CLOSED",
      isOpen,
      deadline: entry.deadline,
    });

  } catch (error) {
    console.error("Deadline check error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
