// import PlacementCalendar from "../models/placement-calendar.js";

// // ✅ Add or Update a date entry
// export const addOrUpdatePlacementEntry = async (req, res) => {
//   try {
//     const { date, companies, dayStatus } = req.body;
//     console.log("Companies:", companies);

//     if (!date) {
//       return res.status(400).json({ message: "Date is required." });
//     }

//     // Either update existing or create new
//     const entry = await PlacementCalendar.findOneAndUpdate(
//       { date },
//       {
//         $push: { companies: { $each: companies || [] } }
//       },
//       { new: true, upsert: true } // create if doesn't exist
//     );

//     res.status(200).json({ message: "Placement entry added/updated successfully", entry });
//   } catch (error) {
//     res.status(500).json({ message: "Error adding/updating placement entry", error: error.message });
//   }
// };

// // ✅ Edit a specific company process in a date entry
// export const editCompanyProcess = async (req, res) => {
//   try {
//     const { date } = req.params;
//     const { companyId, updatedData } = req.body;

//     if (!companyId) return res.status(400).json({ message: "Company ID is required." });

//     const entry = await PlacementCalendar.findOneAndUpdate(
//       { date, "companies._id": companyId },
//       { $set: { "companies.$": { ...updatedData, _id: companyId } } },
//       { new: true }
//     );

//     if (!entry) return res.status(404).json({ message: "Entry or company not found." });

//     res.status(200).json({ message: "Company process updated successfully", entry });
//   } catch (error) {
//     res.status(500).json({ message: "Error editing company process", error: error.message });
//   }
// };

// // ✅ Delete one company process from a date entry
// export const deleteCompanyProcess = async (req, res) => {
//   try {
//     const { date, companyId } = req.params;

//     const entry = await PlacementCalendar.findOneAndUpdate(
//       { date },
//       { $pull: { companies: { _id: companyId } } },
//       { new: true }
//     );

//     if (!entry) return res.status(404).json({ message: "Entry not found." });

//     res.status(200).json({ message: "Company process deleted successfully", entry });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting company process", error: error.message });
//   }
// };

// // ✅ Delete all company processes of a date
// export const deleteAllCompanyProcesses = async (req, res) => {
//   try {
//     const { date } = req.params;

//     const entry = await PlacementCalendar.findOneAndUpdate(
//       { date },
//       { $set: { companies: [] } },
//       { new: true }
//     );

//     if (!entry) return res.status(404).json({ message: "Entry not found." });

//     res.status(200).json({ message: "All company processes deleted successfully", entry });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting all company processes", error: error.message });
//   }
// };

// // ✅ Fetch entries month & year wise
// export const getPlacementsByMonth = async (req, res) => {
//   try {
//     const { month, year } = req.params; // e.g. month = 9, year = 2025
//     console.log(month, year);

//     if (!month || !year) {
//       return res.status(400).json({ message: "Month and year are required." });
//     }

//     const startDate = new Date(year, month - 1, 1);
//     const endDate = new Date(year, month, 0, 23, 59, 59);

//     const entries = await PlacementCalendar.find({
//       date: { $gte: startDate, $lte: endDate }
//     }).sort({ date: 1 });

//     console.log(entries);

//     res.status(200).json(entries);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching placement entries", error: error.message });
//   }
// };




import PlacementCalendar from "../models/placement-calendar.js";

// ✅ Add or Update a date entry
export const addOrUpdatePlacementEntry = async (req, res) => {
  try {
    const { date, companies } = req.body;
    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return res.status(400).json({ message: "Companies array is required and cannot be empty." });
    }

    const update = {
      $push: { companies: { $each: companies } },
      $set: { dayStatus: "" }
    };

    // Either update existing or create new
    const entry = await PlacementCalendar.findOneAndUpdate(
      { date },
      update,
      { new: true, upsert: true } // create if doesn't exist
    );

    res.status(200).json({ message: "Placement entry added/updated successfully", entry });
  } catch (error) {
    res.status(500).json({ message: "Error adding/updating placement entry", error: error.message });
  }
};

// ✅ Set dayStatus for a date (only when no companies)
export const setDayStatus = async (req, res) => {
  try {
    const { date } = req.params;
    const { dayStatus } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }

    // Check if companies exist
    const existing = await PlacementCalendar.findOne({ date });
    if (existing && existing.companies.length > 0) {
      return res.status(400).json({ message: "Cannot set dayStatus when company processes are present." });
    }

    const cleanStatus = dayStatus?.trim() || "";
    const entry = await PlacementCalendar.findOneAndUpdate(
      { date },
      { $set: { dayStatus: cleanStatus } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Day status set successfully", entry });
  } catch (error) {
    res.status(500).json({ message: "Error setting day status", error: error.message });
  }
};

// ✅ Edit a specific company process in a date entry
export const editCompanyProcess = async (req, res) => {
  try {
    const { date } = req.params;
    const { companyId, updatedData } = req.body;

    if (!companyId) return res.status(400).json({ message: "Company ID is required." });

    const entry = await PlacementCalendar.findOneAndUpdate(
      { date, "companies._id": companyId },
      { $set: { "companies.$": { ...updatedData, _id: companyId } } },
      { new: true }
    );

    if (!entry) return res.status(404).json({ message: "Entry or company not found." });

    res.status(200).json({ message: "Company process updated successfully", entry });
  } catch (error) {
    res.status(500).json({ message: "Error editing company process", error: error.message });
  }
};

// ✅ Delete one company process from a date entry
export const deleteCompanyProcess = async (req, res) => {
  try {
    const { date, companyId } = req.params;

    let entry = await PlacementCalendar.findOneAndUpdate(
      { date },
      { $pull: { companies: { _id: companyId } } },
      { new: true }
    );

    if (!entry) return res.status(404).json({ message: "Entry not found." });

    // If no companies left, set dayStatus to "" (optional: preserves if set otherwise)
    if (entry.companies.length === 0) {
      entry = await PlacementCalendar.findOneAndUpdate(
        { date },
        { $set: { dayStatus: "" } },
        { new: true }
      );
    }

    res.status(200).json({ message: "Company process deleted successfully", entry });
  } catch (error) {
    res.status(500).json({ message: "Error deleting company process", error: error.message });
  }
};

// ✅ Delete all company processes of a date
export const deleteAllCompanyProcesses = async (req, res) => {
  try {
    const { date } = req.params;

    let entry = await PlacementCalendar.findOneAndUpdate(
      { date },
      { $set: { companies: [] } },
      { new: true }
    );

    if (!entry) return res.status(404).json({ message: "Entry not found." });

    // If companies now empty, set dayStatus to ""
    if (entry.companies.length === 0) {
      entry = await PlacementCalendar.findOneAndUpdate(
        { date },
        { $set: { dayStatus: "" } },
        { new: true }
      );
    }

    res.status(200).json({ message: "All company processes deleted successfully", entry });
  } catch (error) {
    res.status(500).json({ message: "Error deleting all company processes", error: error.message });
  }
};

// ✅ Fetch entries month & year wise
export const getPlacementsByMonth = async (req, res) => {
  try {
    const { month, year } = req.params; // e.g. month = 9, year = 2025

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required." });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const entries = await PlacementCalendar.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching placement entries", error: error.message });
  }
};