import express from 'express';
const router = express.Router();

import { restrictTo } from '../utils/restrict.js';
import {addQuestion,getQuestionsByCompany, getQuestions} from '../controller/questionbank.js';

router.post('/add-question',restrictTo('Student'),addQuestion);
router.get('/get-question', restrictTo('Student'), getQuestions);
router.get('/get-question/:companyName',restrictTo('Student'),getQuestionsByCompany);

export default router;