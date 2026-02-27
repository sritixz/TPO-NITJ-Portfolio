import express from "express";
import {
  generateToken,
  submitApplication,
  downloadPDF,
  getApplications,
  exportExcel
} from "../controllers/representative.controller.js";

import restrictTo from "../utils/restrict.js"

const router = express.Router();

//student
router.post("/generate-token", restrictTo('Student'), generateToken);
router.post("/submit", restrictTo('Student'), submitApplication);


//professor
router.get("/pdf/:id", restrictTo('Professor'), downloadPDF);
router.get("/list", restrictTo('Professor'), getApplications);
router.get("/export", restrictTo('Professor'), exportExcel);

export default router;