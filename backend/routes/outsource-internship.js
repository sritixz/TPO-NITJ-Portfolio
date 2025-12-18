import express from 'express';
import {
  createInternship,
  getAllInternships,
  getInternshipById,
  updateInternship,
  lockInternshipApplication,
  deleteInternship
} from '../controller/outsource-internship/lte2month.js';

import { checkOutsiderEmail, handleLoginOutsider, handleOTPGeneration, handleSignUp, verifyOutsiderOtp } from '../controller/outsource-internship/auth.js';

import {
  createLongTermInternship,
  getAllLongTermInternships,
  getLongTermInternshipById,
  updateLongTermInternship,
  lockLongTermInternshipApplication,
  deleteLongTermInternship
} from '../controller/outsource-internship/gte3month.js';
const router = express.Router();


//authentication
router.post('/emailVerification', handleOTPGeneration)
router.post('/verifyOtp', verifyOutsiderOtp)
router.post('/signup', handleSignUp)
router.post('/login', handleLoginOutsider)
router.get('/checkEmail', checkOutsiderEmail)


// summer/winter internship routes
router.post('/lte2month/', createInternship);
router.get('/lte2month/', getAllInternships);
router.get('/lte2month/:id', getInternshipById);
router.put('/lte2month/:id', updateInternship);
router.put('/lte2month/lock/:id', lockInternshipApplication);
router.delete('/lte2month/:id', deleteInternship);

// more than 3 months internship routes
router.post('/gte3month/', createLongTermInternship);
router.get('/gte3month/', getAllLongTermInternships);
router.get('/gte3month/:id', getLongTermInternshipById);
router.put('/gte3month/:id', updateLongTermInternship);
router.put('/gte3month/lock/:id', lockLongTermInternshipApplication);
router.delete('/gte3month/:id', deleteLongTermInternship);

export default router;