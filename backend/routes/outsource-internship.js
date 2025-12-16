import express from 'express';
import {
  createInternship,
  getAllInternships,
  getInternshipById,
  updateInternship,
  lockInternshipApplication,
  deleteInternship
} from '../controller/outsource-internship/lte2month.js';

const router = express.Router();


//summer/winter internship routes
router.post('/lte2month/', createInternship);
router.get('/lte2month/', getAllInternships);
router.get('/lte2month/:id', getInternshipById);
router.put('/lte2month/:id', updateInternship);
router.put('/lte2month/lock/:id', lockInternshipApplication);
router.delete('/lte2month/:id', deleteInternship);

//more than 3 months internship routes


export default router;