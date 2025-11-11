import Alert from "../../models/alert.js";

// Create a new alert
export const createAlert = async (req, res) => {
  try {
    const { title, message, type, isActive, showOnLoad, startDate, endDate } = req.body;

    const newAlert = new Alert({
      title,
      message,
      type,
      isActive,
      showOnLoad,
      startDate,
      endDate,
    });

    await newAlert.save();
    res.status(201).json({ success: true, message: "Alert created successfully", alert: newAlert });
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).json({ success: false, message: "Failed to create alert" });
  }
};

// Get all alerts
export const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch alerts" });
  }
};

// Get currently active alerts
export const getActiveAlerts = async (req, res) => {
  try {
    const now = new Date();
    const alerts = await Alert.find({
      isActive: true,
      $or: [
        { endDate: null },
        { endDate: { $gte: now } },
      ],
      startDate: { $lte: now },
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, alerts });
  } catch (error) {
    console.error("Error fetching active alerts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch active alerts" });
  }
};

// Update an alert (toggle or edit)
export const updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedAlert = await Alert.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedAlert) return res.status(404).json({ success: false, message: "Alert not found" });

    res.status(200).json({ success: true, message: "Alert updated successfully", alert: updatedAlert });
  } catch (error) {
    console.error("Error updating alert:", error);
    res.status(500).json({ success: false, message: "Failed to update alert" });
  }
};

// Delete an alert
export const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Alert.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ success: false, message: "Alert not found" });

    res.status(200).json({ success: true, message: "Alert deleted successfully" });
  } catch (error) {
    console.error("Error deleting alert:", error);
    res.status(500).json({ success: false, message: "Failed to delete alert" });
  }
};
