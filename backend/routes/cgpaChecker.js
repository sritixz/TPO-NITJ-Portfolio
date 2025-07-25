import express from 'express';
import { validateCgpa } from '../controller/cgpaChecker.js';

const router = express.Router();

router.post('/validate-cgpa', validateCgpa);


export default router;