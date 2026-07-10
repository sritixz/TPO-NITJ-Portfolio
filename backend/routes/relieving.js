import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { restrictTo } from "../utils/restrict.js";
import { getNOCs, createNOC, updateNOC, lockNOC, deleteNOC, getLockedNOCsForProfessors,updateNOCStatus,updateNOCByProfessor, getRelievingDetailsForDownload } from '../controller/relieving.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------
// MULTER STORAGE
// ---------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const field = file.fieldname;  
    const uploadDir = path.join(__dirname, '..', 'uploads', 'relieving', field);

    fs.mkdirSync(uploadDir, { recursive: true });

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });
const router = express.Router();

// ---------------------------
// ROUTES
// ---------------------------
router.get('/', restrictTo('Student'), getNOCs);
router.put('/lock/:id', restrictTo('Student'), lockNOC);
router.delete('/:id', restrictTo('Student'), deleteNOC);

router.post(
  '/', restrictTo('Student'),
  upload.fields([
    { name: 'offerLetter', maxCount: 1 },
    { name: 'turnoverReport', maxCount: 1 },
    { name: 'mailScreenshot', maxCount: 1 },
    { name: 'startupIndiaRecognitionCertificate', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ]),
  createNOC
);

router.put(
  '/:id', restrictTo('Student'),
  upload.fields([
    { name: 'offerLetter', maxCount: 1 },
    { name: 'turnoverReport', maxCount: 1 },
    { name: 'mailScreenshot', maxCount: 1 },
    { name: 'startupIndiaRecognitionCertificate', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ]),
  updateNOC
);

router.get("/professor/locked", restrictTo('Professor'), getLockedNOCsForProfessors);
router.put("/professor/edit/:id", restrictTo('Professor'),
  upload.fields([
    { name: 'offerLetter', maxCount: 1 },
    { name: 'turnoverReport', maxCount: 1 },
    { name: 'mailScreenshot', maxCount: 1 },
    { name: 'startupIndiaRecognitionCertificate', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ]), updateNOCByProfessor);
router.put("/professor/:id/change-status/:nocStatus", restrictTo('Professor'), updateNOCStatus);

router.get("/download-verify/:id", restrictTo('Student'), getRelievingDetailsForDownload);

export default router;
