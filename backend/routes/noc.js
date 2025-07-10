import express from "express";
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises'; // For async file operations
import { existsSync, mkdirSync } from 'fs'; // Import synchronous methods
const router = express.Router();

import {createNOC, getAllNOCs, getNOCById, updateNOC, deleteNOC, uploadOfferLetter, getAllNOCstoprofessors, getAllNOCstodepartments} from '../controller/noc.js';
import { restrictTo } from "../utils/restrict.js";
import Student from "../models/user_model/student.js";

const uploadDir = path.join(process.cwd(), 'uploads', 'offer-letters');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/offer-letters/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

router.post('/',restrictTo('Student'), createNOC);
router.get('/', restrictTo('Student'),getAllNOCs);
router.get('/getonp', restrictTo('Professor'), getAllNOCstoprofessors);
router.get('/getond', restrictTo('Department'), getAllNOCstodepartments);
router.post('/upload-offer-letter/:id',restrictTo('Student'), upload.single('offerLetter'), uploadOfferLetter);
router.get('/:id',restrictTo('Professor'), getNOCById);
router.put('/:id',restrictTo('Professor'), updateNOC);
router.delete('/:id', restrictTo('Professor'), deleteNOC);

export default router;