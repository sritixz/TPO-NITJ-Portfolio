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

export const addStudentToOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const data = { ...req.body };

    // remove empty studentId
    if (!data.studentId) delete data.studentId;

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    // prevent duplicate by name + department
    const exists = offer.shortlisted_students.some(
      (s) =>
        s.name?.toLowerCase() === data.name?.toLowerCase() &&
        s.department === data.department
    );

    if (exists) {
      return res.status(400).json({ message: "Student already exists" });
    }

    offer.shortlisted_students.push(data);
    await offer.save();

    res.status(200).json({ message: "Student added", offer });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /admin/offers/:offerId/student/:studentId
export const updateStudentInOffer = async (req, res) => {
  try {
    const { offerId, studentId } = req.params;

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ error: "Offer not found" });

    const student = offer.shortlisted_students.id(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    Object.assign(student, req.body);
    if (!student.studentId) student.studentId = undefined;

    await offer.save();

    res.status(200).json(offer);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE /admin/offers/:offerId/student/:studentId
export const deleteStudentFromOffer = async (req, res) => {
  try {
    const { offerId, studentId } = req.params;

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ error: "Offer not found" });

    offer.shortlisted_students = offer.shortlisted_students.filter(
      (s) => s._id.toString() !== studentId
    );

    await offer.save();
    res.status(200).json({ message: "Student removed", offer });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
