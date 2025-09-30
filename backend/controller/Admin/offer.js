import Offer from "../../models/offer.js";

// Create
export const addOffer = async (req, res) => {
  try {
    const o = new Offer(req.body);
    const s = await o.save();
    res.status(201).json(s);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Get all
export const getOffers = async (req, res) => {
  try {
    const o = await Offer.find()
      .populate("jobId")
      .populate("shortlisted_students.studentId");
    res.status(200).json(o);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Get one
export const getOffer = async (req, res) => {
  try {
    const o = await Offer.findById(req.params.id)
      .populate("jobId")
      .populate("shortlisted_students.studentId");
    if (!o) return res.status(404).json({ error: "Not found" });
    res.status(200).json(o);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Update one
export const updateOffer = async (req, res) => {
  try {
    const o = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!o) return res.status(404).json({ error: "Not found" });
    res.status(200).json(o);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Delete one
export const deleteOffer = async (req, res) => {
  try {
    const o = await Offer.findByIdAndDelete(req.params.id);
    if (!o) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Bulk delete
export const deleteBulkOffers = async (req, res) => {
  try {
    const { ids } = req.body;
    await Offer.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: "Bulk delete successful" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
