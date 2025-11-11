import express from 'express';
import { getPlacementReports, getStudentConnect } from '../controller/pplacementReport.js';
const router = express.Router();
import { restrictTo } from '../utils/restrict.js';

router.get('/placement-reports', restrictTo('Professor'), getPlacementReports);
router.get('/student-connect', restrictTo('Student'), getStudentConnect);
export default router;