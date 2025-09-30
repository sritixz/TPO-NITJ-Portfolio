import OfferTracker from "../../models/offertracker.js";

// Create
export const addOfferTracker = async (req, res) => {
  try {
    const o = new OfferTracker(req.body);
    const s = await o.save();
    res.status(201).json(s);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Get all
export const getOfferTrackers = async (req, res) => {
  try {
    const o = await OfferTracker.find().populate("studentId");
    res.status(200).json(o);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Get one
export const getOfferTracker = async (req, res) => {
  try {
    const o = await OfferTracker.findById(req.params.id).populate("studentId");
    if (!o) return res.status(404).json({ error: "Not found" });
    res.status(200).json(o);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Update one
export const updateOfferTracker = async (req, res) => {
  try {
    const o = await OfferTracker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!o) return res.status(404).json({ error: "Not found" });
    res.status(200).json(o);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Delete one
export const deleteOfferTracker = async (req, res) => {
  try {
    const o = await OfferTracker.findByIdAndDelete(req.params.id);
    if (!o) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Delete bulk
export const deleteBulkOfferTrackers = async (req, res) => {
  try {
    const { ids } = req.body;
    await OfferTracker.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: "Bulk delete successful" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
