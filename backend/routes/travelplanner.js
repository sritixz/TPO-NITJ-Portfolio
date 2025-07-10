import express from 'express';
const router = express.Router();
import { restrictTo } from '../utils/restrict.js';
import {createtp,gettp, getTravelPlanner, updatefoodtp, updateroomtp, updatevehicletp} from '../controller/travelplanner.js';

// router.get('/get',gettp);
// router.get('/getttp',getTravelPlanner);
router.post('/create', restrictTo('Recuiter'),createtp);
router.post('/food',restrictTo('Professor'),updatefoodtp);
router.post('/room',restrictTo('Professor'),updateroomtp);
router.post('/vehicle',restrictTo('Professor'),updatevehicletp);

export default router;