import express from 'express';
import { restrictTo } from '../utils/restrict.js';
import { getBrochures, addBrochure, updateBrochure, deleteBrochure } from '../controller/Brochure.js';

const router = express.Router();

router.get('/get', getBrochures);
router.post('/add', restrictTo('Admin'), addBrochure);
router.put('/update/:id', restrictTo('Admin'), updateBrochure);
router.delete('/delete', restrictTo('Admin'), deleteBrochure);

export default router;