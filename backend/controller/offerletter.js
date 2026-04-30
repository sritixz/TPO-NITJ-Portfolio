import OfferLetter from "../models/offerletter.js";
import ApplicationDeadline from "../models/applicationdeadline.js";
export const updateOffer = async (req, res) => {
  try {
    const offer = await OfferLetter.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    if (offer.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }
    // ⏰ Deadline check (IMPORTANT)
    // if (new Date() > new Date(offer.deadline)) {
    //   return res.status(403).json({ message: "Deadline passed" });
    // }

    // ✏️ Update fields
    offer.totalOffers = req.body.totalOffers || offer.totalOffers;
    offer.acceptedCompany = req.body.acceptedCompany || offer.acceptedCompany;
    offer.linkedin = req.body.linkedin || offer.linkedin;
    offer.offerLetter = req.file ? req.file.path : offer.offerLetter; // if new file uploaded
    await offer.save();

    res.json({ message: "Updated successfully", offer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};
export const setDeadline = async (req, res) => {
  const { type, deadline } = req.body;

  const doc = await ApplicationDeadline.findOneAndUpdate(
    { type },
    { deadline },
    { upsert: true, new: true },
  );

  // console.log(`Deadline for ${type} set to:`, doc.deadline);
  res.json({
    message: "Deadline updated",
    deadline: doc.deadline,
  });
};

export const getDeadlineByType = async (req, res) => {
  try {
    const { type } = req.params;

    const doc = await ApplicationDeadline.findOne({ type });

    if (!doc) {
      return res.json({ deadline: null });
    }

    res.json({
      deadline: doc.deadline,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching deadline" });
  }
};
export const submitOffer = async (req, res) => {
  try {
    const { totalOffers, acceptedCompany, linkedin } = req.body;
    // console.log("Received offer submission:", { totalOffers, acceptedCompany, file: req.file });
    // console.log("Authenticated user:", req.user);
    if (!totalOffers || !acceptedCompany) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Offer letter file required",
      });
    }
    const offer = new OfferLetter({
      student: req.user.userId,
      totalOffers,
      acceptedCompany,
      linkedin,
      offerLetter: req.file.path, // assuming multer
    });

    await offer.save();

    res.status(201).json({
      message: "Offer submitted successfully",
      offer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

import fs from "fs";
import path from "path";

export const deleteOffer = async (req, res) => {
  try {
    const offer = await OfferLetter.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // 🧹 Delete file (if exists)
    if (offer.offerLetter) {
      const filePath = path.join(
        process.cwd(),
        offer.offerLetter.replace(/^\/+/, ""), // 🔥 important fix
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 🗑️ Delete DB record (FIXED MODEL)
    await OfferLetter.findByIdAndDelete(req.params.id);

    res.json({ message: "Offer deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
export const getAllOffers = async (req, res) => {
  try {
    const { batch, course, department } = req.query;
    // console.log("Fetching offers with filters:", { batch, course, department });
    let filter = {};

    // filter on populated fields → handled later
    const offers = await OfferLetter.find().populate(
      "student",
      "name rollno batch course department",
    );

    // 🔥 manual filtering (since fields are in populated student)
    const filtered = offers.filter((offer) => {
      return (
        (!batch || offer.student.batch === batch) &&
        (!course || offer.student.course === course) &&
        (!department || offer.student.department === department)
      );
    });

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching offers" });
  }
};
// export const getStudentProfile = async (req, res) => {
//   const student = await Student.findById(req.user.id).select(
//     "name department batch course rollno"
//   );

//   res.json(student);
// };
