import Offer from "../../models/offer.js";
import JobProfile from "../../models/jobprofile.js";
import mongoose from "mongoose";

const isAutoOffer = (offer) =>
  offer?.jobId && mongoose.Types.ObjectId.isValid(offer.jobId);

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
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ error: "Not found" });
    }

    //only auto-generated offers clean JobProfile
    if (offer.jobId && mongoose.Types.ObjectId.isValid(offer.jobId)) {
      const studentIds = offer.shortlisted_students
        .map((s) => s.studentId)
        .filter(Boolean);

      if (studentIds.length > 0) {
        await JobProfile.updateOne(
          { _id: offer.jobId },
          { $pull: { final_shortlisted_students: { $in: studentIds } } }
        );
      }
    }

    await Offer.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Deleted successfully" });
  } catch (e) {
    console.error("deleteOffer:", e);
    res.status(500).json({ error: e.message });
  }
};


// Bulk delete


export const deleteBulkOffers = async (req, res) => {
  try {
    const { ids } = req.body;

    const offers = await Offer.find({ _id: { $in: ids } });

    const jobStudentMap = {};

    offers.forEach((offer) => {
      // skip manual offers
      if (!offer.jobId || !mongoose.Types.ObjectId.isValid(offer.jobId)) return;

      const jobId = offer.jobId.toString();
      if (!jobStudentMap[jobId]) jobStudentMap[jobId] = [];

      offer.shortlisted_students.forEach((s) => {
        if (s.studentId) jobStudentMap[jobId].push(s.studentId);
      });
    });

    await Promise.all(
      Object.entries(jobStudentMap).map(([jobId, studentIds]) =>
        JobProfile.updateOne(
          { _id: jobId },
          { $pull: { final_shortlisted_students: { $in: studentIds } } }
        )
      )
    );

    await Offer.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ message: "Bulk delete successful" });
  } catch (e) {
    console.error("deleteBulkOffers:", e);
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
    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }

    const removedStudent = offer.shortlisted_students.find(
      (s) => s._id.toString() === studentId
    );

    offer.shortlisted_students = offer.shortlisted_students.filter(
      (s) => s._id.toString() !== studentId
    );

    await offer.save();

    // only auto-generated offers touch JobProfile
    if (
      removedStudent?.studentId &&
      offer.jobId &&
      mongoose.Types.ObjectId.isValid(offer.jobId)
    ) {
      await JobProfile.updateOne(
        { _id: offer.jobId },
        { $pull: { final_shortlisted_students: removedStudent.studentId } }
      );
    }

    res.status(200).json({ message: "Student removed", offer });
  } catch (e) {
    console.error("deleteStudentFromOffer:", e);
    res.status(500).json({ error: e.message });
  }
};

