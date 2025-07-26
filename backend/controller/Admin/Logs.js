import Logs from "../../models/logs.js";

export const getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;        // default page 1
    const limit = parseInt(req.query.limit) || 20;     // default 20 logs per page
    const skip = (page - 1) * limit;

    const totalLogs = await Logs.countDocuments();

    const logs = await Logs.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      page,
      limit,
      totalPages: Math.ceil(totalLogs / limit),
      totalLogs,
      logs,
    });
  } catch (err) {
    console.error("Error fetching logs:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
