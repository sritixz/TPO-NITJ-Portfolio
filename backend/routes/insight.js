// backend/routes/insightRoutes.js
import express from 'express';
import {getOfferInsights , setInsight, getInsight } from '../controller/insight.js';

const router = express.Router();

// Route for offer insights (statistics from Offer model)
router.get('/stats', getOfferInsights);

// Routes for Insight model (setting and getting goals, etc.)
router.post('/set', setInsight);
router.get('/get', getInsight);

export default router;