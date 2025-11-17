import PlacementCalendar from "../../models/placement-calendar.js";

// ------------------------------
// CREATE a new placement calendar entry
// ------------------------------
export const createPlacementCalendar = async (req, res) => {
  try {
    const { date, dayStatus, companies } = req.body;

    const existing = await PlacementCalendar.findOne({ date });
    if (existing) {
      return res.status(400).json({ message: "Calendar entry for this date already exists." });
    }

    const calendar = new PlacementCalendar({ date, dayStatus, companies });
    await calendar.save();

    res.status(201).json({ message: "Placement calendar created successfully", calendar });
  } catch (error) {
    res.status(500).json({ message: "Error creating placement calendar", error: error.message });
  }
};

// ------------------------------
// FETCH all placement calendar entries (with filters, pagination, search)
// ------------------------------
export const getAllPlacementCalendars = async (req, res) => {
  try {
    console.log("rty");
    const { startDate, endDate, company, status, dayStatus, page = 1, limit = 20 } = req.query;
    console.log(startDate, endDate, company, status, dayStatus, page, limit);

    const filter = {};

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (dayStatus) {
      filter.dayStatus = dayStatus;
    }

    if (company) {
      filter["companies.company"] = { $regex: company, $options: "i" };
    }

    if (status) {
      filter["companies.status"] = status;
    }

    const skip = (page - 1) * limit;

    const calendars = await PlacementCalendar.find(filter)
      .sort({ date: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await PlacementCalendar.countDocuments(filter);

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      calendars,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching placement calendars", error: error.message });
  }
};

// ------------------------------
// FETCH single placement calendar by ID
// ------------------------------
export const getPlacementCalendarById = async (req, res) => {
  try {
    const { id } = req.params;
    const calendar = await PlacementCalendar.findById(id);

    if (!calendar) return res.status(404).json({ message: "Calendar not found" });

    res.status(200).json(calendar);
  } catch (error) {
    res.status(500).json({ message: "Error fetching calendar", error: error.message });
  }
};

// ------------------------------
// UPDATE a placement calendar (date, dayStatus, or companies)
// ------------------------------
export const updatePlacementCalendar = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedCalendar = await PlacementCalendar.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCalendar) {
      return res.status(404).json({ message: "Calendar not found" });
    }

    res.status(200).json({ message: "Calendar updated successfully", updatedCalendar });
  } catch (error) {
    res.status(500).json({ message: "Error updating calendar", error: error.message });
  }
};

// ------------------------------
// DELETE one placement calendar
// ------------------------------
export const deletePlacementCalendar = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PlacementCalendar.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Calendar not found" });
    }

    res.status(200).json({ message: "Calendar deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting calendar", error: error.message });
  }
};

// ------------------------------
// DELETE multiple placement calendars (by IDs or date range)
// ------------------------------
export const deleteManyPlacementCalendars = async (req, res) => {
  try {
    const { ids, startDate, endDate } = req.body;

    let filter = {};

    if (ids?.length > 0) filter._id = { $in: ids };
    if (startDate && endDate)
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const result = await PlacementCalendar.deleteMany(filter);

    res.status(200).json({ message: "Calendars deleted successfully", deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: "Error deleting calendars", error: error.message });
  }
};

// ------------------------------
// ADD company process to a specific date
// ------------------------------
export const addCompanyToCalendar = async (req, res) => {
  try {
    const { date } = req.params;
    const companyData = req.body;

    const calendar = await PlacementCalendar.findOne({ date: new Date(date) });
    if (!calendar) return res.status(404).json({ message: "Calendar not found for this date" });

    calendar.companies.push(companyData);
    await calendar.save();

    res.status(200).json({ message: "Company added successfully", calendar });
  } catch (error) {
    res.status(500).json({ message: "Error adding company", error: error.message });
  }
};

// ------------------------------
// REMOVE a specific company from a date
// ------------------------------
export const removeCompanyFromCalendar = async (req, res) => {
  try {
    const { date, companyId } = req.params;

    const calendar = await PlacementCalendar.findOne({ date: new Date(date) });
    if (!calendar) return res.status(404).json({ message: "Calendar not found" });

    calendar.companies = calendar.companies.filter(c => c._id.toString() !== companyId);
    await calendar.save();

    res.status(200).json({ message: "Company removed successfully", calendar });
  } catch (error) {
    res.status(500).json({ message: "Error removing company", error: error.message });
  }
};

// ------------------------------
// FILTER: Get upcoming or past events
// ------------------------------
export const getUpcomingOrPastCalendars = async (req, res) => {
  try {
    const { type } = req.query; // "upcoming" or "past"
    const today = new Date();

    let filter = {};
    if (type === "upcoming") {
      filter.date = { $gte: today };
    } else if (type === "past") {
      filter.date = { $lt: today };
    }

    const data = await PlacementCalendar.find(filter).sort({ date: 1 });

    res.status(200).json({ count: data.length, data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching filtered calendars", error: error.message });
  }
};
