import express from 'express';
import { getOfferInsights, getSummerInternInsights, downloadEligibleExcel } from '../controller/insight.js';

const router = express.Router();

router.get('/stats',             getOfferInsights);
router.get('/summerInternstats', getSummerInternInsights);
router.get('/internship-stats',  getSummerInternInsights); // alias for frontend
router.get('/download-eligible', downloadEligibleExcel);

export default router;
