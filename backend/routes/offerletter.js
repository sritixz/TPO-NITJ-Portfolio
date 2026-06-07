import express from "express";
import { uploadOffer } from "../utils/offerMulter.js";
import { submitOffer } from "../controller/offerletter.js";
// import { protect } from "../middleware/authMiddleware.js";
import { getAllOffers } from "../controller/offerletter.js";
import {restrictTo} from "../utils/restrict.js"
import { deleteOffer , updateOffer} from "../controller/offerletter.js";
import { setDeadline, getDeadlineByType } from "../controller/offerletter.js";
import OfferLetter from "../models/offerletter.js";
const router = express.Router();
// router.put("/update/:id", restrictTo("Student"), updateOffer);
router.post(
  "/submit",
//   protect,
restrictTo('Student'),
  uploadOffer.single("offerLetter"),
  submitOffer
);
router.get("/my", restrictTo('Student'), async (req, res) => {
  const offer = await OfferLetter.findOne({ student: req.user.userId });
  res.json(offer);
});
// router.put("/update/:id", restrictTo("Student"), async (req, res) => {
//   const updated = await OfferLetter.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     { new: true }
//   );

//   res.json(updated);
// });

router.put(
  "/update/:id",
  restrictTo("Student"),
  uploadOffer.single("offerLetter"),
  async (req, res) => {
    try {
      const updateData = {
        totalOffers: req.body.totalOffers,
        acceptedCompany: req.body.acceptedCompany,
        linkedin: req.body.linkedin,
        hrName: req.body.hrName,
    hrEmail: req.body.hrEmail,
   ctc: req.body.ctc
      };

      if (req.file) {
        updateData.offerLetter = req.file.path;
      }

      const updated = await OfferLetter.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.json(updated);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Update failed" });
    }
  }
);
router.post("/setdeadline",restrictTo("Professor"), setDeadline); // already exists
router.get("/deadline/:type", getDeadlineByType);
// ✅ ADD THIS
// router.get("/:type", getDeadlineByType);
router.get("/all",getAllOffers);
router.delete("/delete/:id", restrictTo("Professor"), deleteOffer);
export default router;