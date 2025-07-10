import express from "express";
const router=express.Router();

import {
    submitExperience,
    getAllExperiences,
    getExperience,
    updateExperience,
    deleteExperience
    } from "../controller/sharedexperience.js";
import { restrictTo } from "../utils/restrict.js";


router.get('/', restrictTo('Professor','Student'), getAllExperiences);
router.get('/:id', restrictTo('Professor','Student'), getExperience);

router.post('/submit', restrictTo('Student'), submitExperience);
router.post('/:id', restrictTo('Professor','Student'), updateExperience);
router.delete('/:id',restrictTo('Professor','Student'), deleteExperience);

export default router;