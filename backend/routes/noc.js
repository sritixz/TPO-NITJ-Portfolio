// Updated routes file (noc.js routes)

import express from "express";
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises'; // For async file operations
import { existsSync, mkdirSync } from 'fs'; // Import synchronous methods
const router = express.Router();

import {createNOC, getAllNOCs, getNOCById, updateNOC, deleteNOC, uploadOfferLetter, uploadTurnoverReport, uploadMailScreenshot, getAllNOCstoprofessors, getAllNOCstodepartments} from '../controller/noc.js';
import { restrictTo } from "../utils/restrict.js";
import Student from "../models/user_model/student.js";

// Offer Letter Upload Configuration
const offerDir = path.join(process.cwd(), 'uploads', 'offer-letters');
if (!existsSync(offerDir)) {
  mkdirSync(offerDir, { recursive: true });
}

const offerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/offer-letters/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const offerUpload = multer({ 
  storage: offerStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Turnover Report Upload Configuration
const turnoverDir = path.join(process.cwd(), 'uploads', 'turnover-reports');
if (!existsSync(turnoverDir)) {
  mkdirSync(turnoverDir, { recursive: true });
}

const turnoverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/turnover-reports/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const turnoverUpload = multer({ 
  storage: turnoverStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Mail Screenshot Upload Configuration
const mailDir = path.join(process.cwd(), 'uploads', 'mail-screenshots');
if (!existsSync(mailDir)) {
  mkdirSync(mailDir, { recursive: true });
}

const mailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/mail-screenshots/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const mailUpload = multer({ 
  storage: mailStorage,
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
router.post('/upload-offer-letter/:id',restrictTo('Student'), offerUpload.single('offerLetter'), uploadOfferLetter);
router.post('/upload-turnover-report/:id',restrictTo('Student'), turnoverUpload.single('turnoverReport'), uploadTurnoverReport);
router.post('/upload-mail-screenshot/:id',restrictTo('Student'), mailUpload.single('mailScreenshot'), uploadMailScreenshot);
router.get('/:id',restrictTo('Professor'), getNOCById);
router.put('/:id',restrictTo('Professor'), updateNOC);
router.delete('/:id', restrictTo('Professor'), deleteNOC);

export default router;