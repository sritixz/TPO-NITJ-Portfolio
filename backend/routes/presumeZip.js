import express from "express";
import multer from "multer";
import { generateResumeZip } from "../controller/presumeZip.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post(
  "/generate-zip",
  upload.single("excelFile"),
  generateResumeZip
);

export default router;
