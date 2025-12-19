import InternshipApplication from "../../models/outsource-internship/lte2month.js";
import LongTermInternshipApplication from "../../models/outsource-internship/gte3month.js";

export const getAllInternshipsProf = async (req, res) => {
  try {
    const internships = await InternshipApplication.find({});
    res.status(200).json({data: internships});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//pdashboard routes
export const getAllLongTermInternshipsProf = async (req, res) => {
  try {
    const applications = await LongTermInternshipApplication.find({});
    res.status(200).json({data: applications});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const changeStatuslte2month = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // validate status
    const allowedStatuses = ["pending", "verified", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const application = await InternshipApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // update status
    application.status = status;
    await application.save();

    return res.status(200).json({
      message: "Status updated successfully",
      status: application.status,
    });

  } catch (error) {
    console.error("LTE status update error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const changeStatusgte3month = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // validate status
    const allowedStatuses = ["pending", "verified", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const application = await LongTermInternshipApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // update status
    application.status = status;
    await application.save();

    return res.status(200).json({
      message: "Status updated successfully",
      status: application.status,
    });

  } catch (error) {
    console.error("GTE status update error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
