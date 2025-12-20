import express from 'express';
import {
  createInternship,
  getAllInternships,
  getInternshipById,
  updateInternship,
  lockInternshipApplication,
  deleteInternship,
} from '../controller/outsource-internship/lte2month.js';


import {
  createLongTermInternship,
  getAllLongTermInternships,
  getLongTermInternshipById,
  updateLongTermInternship,
  lockLongTermInternshipApplication,
  deleteLongTermInternship,
} from '../controller/outsource-internship/gte3month.js';

import {
  upsertLte2MonthDeadline,
  checkLte2MonthStatus
} from "../controller/outsource-internship/lte2monthdeadline.js";

import { getDocumentsOutsider } from '../controller/outsource-internship/documentOutsider.js';
import { changeStatusgte3month, changeStatuslte2month, getAllInternshipsProf, getAllLongTermInternshipsProf, } from '../controller/outsource-internship/pdashboardInternhsips.js';

const router = express.Router();

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

//document fetch
router.get('/outsiderDocument', getDocumentsOutsider);

//pdashboard routes
router.get('/lte2month/get/data/all',getAllInternshipsProf)
router.get('/gte3month/get/data/all',getAllLongTermInternshipsProf)
router.post('/lte2month/post/changeStatus/:id', changeStatuslte2month)
router.post('/gte3month/post/changeStatus/:id', changeStatusgte3month)

//lte2month deadline
router.post("/lte2month/deadline", upsertLte2MonthDeadline);
router.get("/lte2month/deadline/status", checkLte2MonthStatus);

export default router;