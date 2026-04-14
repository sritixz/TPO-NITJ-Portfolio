import express from "express";
import {
  generateToken,
  submitApplication,
  downloadPDF,
  getApplications,
  exportExcel,
  deleteApplication,
  setDeadline,
  getDeadline
} from "../controller/ir_pr_application.js";
import { uploadSOP } from "../middleware/upload.js";

import {restrictTo} from "../utils/restrict.js"

const router = express.Router();

//student
router.post("/generate-token", restrictTo('Student'), generateToken);
router.post(
  "/submit",
  restrictTo("Student"),
  uploadSOP.single("sop"), // ⭐ MUST MATCH FRONTEND
  submitApplication
);
// router.post("/submit", restrictTo('Student'), submitApplication);
router.delete(
  "/delete-application",
 
  deleteApplication
);

//professor
router.get("/pdf/:id", restrictTo('Student','Professor'), downloadPDF);
router.get("/list", restrictTo('Professor'), getApplications);
router.get("/export", restrictTo('Professor'), exportExcel);
router.post("/set-deadline", restrictTo('Professor'), setDeadline);
router.get("/get-deadline", restrictTo('Student','Professor'), getDeadline);
export default router;