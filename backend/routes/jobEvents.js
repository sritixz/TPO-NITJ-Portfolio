// routes/jobEvents.js
import express from 'express';
import { getJobEvents } from '../controller/jobevents.js';
import { restrictTo } from '../utils/restrict.js';

const router = express.Router();

router.get('/', restrictTo('Student','Professor'), getJobEvents);


export default router;