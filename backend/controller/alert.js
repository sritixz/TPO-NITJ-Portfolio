import Alert from "../models/alert.js";

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
