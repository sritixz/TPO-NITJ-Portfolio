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
export const getOfferTrackerbyId = async (req, res) => {
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

// Delete specific offer in array
export const deleteSpecificOffer = async (req, res) => {
  try {
    const { id, index } = req.params;
    const o = await OfferTracker.findById(id);
    if (!o) return res.status(404).json({ error: "Not found" });
    if (!o.offer || index >= o.offer.length || index < 0) {
      return res.status(400).json({ error: "Invalid offer index" });
    }
    o.offer.splice(index, 1);
    await o.save();
    // Optional: Delete document if no offers left
    if (o.offer.length === 0) {
      await OfferTracker.findByIdAndDelete(id);
      res.status(200).json({ message: "Offer and document deleted successfully" });
    } else {
      const populated = await OfferTracker.findById(o._id).populate("studentId");
      res.status(200).json(populated);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


// Update specific offer in array
export const updateSpecificOffer = async (req, res) => {
  try {
    const { id, index } = req.params;
    const o = await OfferTracker.findById(id);
    if (!o) return res.status(404).json({ error: "Not found" });
    if (!o.offer || index >= o.offer.length || index < 0) {
      return res.status(400).json({ error: "Invalid offer index" });
    }
    o.offer[index] = { ...o.offer[index], ...req.body };
    await o.save();
    const populated = await OfferTracker.findById(o._id).populate("studentId");
    res.status(200).json(populated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
