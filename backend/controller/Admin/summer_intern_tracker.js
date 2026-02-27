import SummerInternTracker from "../../models/summer_intern_tracker.js";

export const getAllSummerInternTrackers = async (req, res) => {
  try {
    const trackers = await SummerInternTracker.find()
      .populate("studentsId", "name email course batch") // populate minimal student fields
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json(trackers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch trackers", error: err.message });
  }
};

/**
 * Remove a student from a tracker document.
 * Route: DELETE /admin/summer-intern-tracker/:docId/student/:studentId
 */
export const removeStudentFromTracker = async (req, res) => {
  try {
    const { docId, studentId } = req.params;

    const tracker = await SummerInternTracker.findById(docId);
    if (!tracker) {
      return res.status(404).json({ message: "Tracker document not found" });
    }

    const existed = tracker.studentsId.some(
      (id) => id.toString() === studentId
    );

    if (!existed) {
      return res.status(400).json({
        message: "Student not present in this tracker",
        tracker,
      });
    }

    tracker.studentsId = tracker.studentsId.filter(
      (id) => id.toString() !== studentId
    );

    await tracker.save();

    const populated = await tracker.populate(
      "studentsId",
      "name email course batch"
    );

    return res.status(200).json({
      message: "Student removed successfully",
      tracker: populated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to remove student",
      error: err.message,
    });
  }
};