import express from 'express';
import { getOfferInsights, getSummerInternInsights } from '../controller/insight.js';

const router = express.Router();

router.get('/stats',             getOfferInsights);
router.get('/summerInternstats', getSummerInternInsights);
router.get('/internship-stats',  getSummerInternInsights); // alias for frontend

export default router;
