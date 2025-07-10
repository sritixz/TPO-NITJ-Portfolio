import express from 'express';
import { getPlacementReports } from '../controller/pplacementReport.js';
const router = express.Router();

router.get('/placement-reports', getPlacementReports);
// router.get('/placement-report-filters', getFilterOptions);
export default router;