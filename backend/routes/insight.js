import express from 'express';
<<<<<<< HEAD
import { getOfferInsights, getSummerInternInsights, downloadEligibleExcel } from '../controller/insight.js';
=======
import { getOfferInsights, getSummerInternInsights } from '../controller/insight.js';
>>>>>>> 95a9aacb050b56a2207ab2e65cacc9af1e91bbc2

const router = express.Router();

router.get('/stats',             getOfferInsights);
router.get('/summerInternstats', getSummerInternInsights);
router.get('/internship-stats',  getSummerInternInsights); // alias for frontend
<<<<<<< HEAD
router.get('/download-eligible', downloadEligibleExcel);
=======
>>>>>>> 95a9aacb050b56a2207ab2e65cacc9af1e91bbc2

export default router;
