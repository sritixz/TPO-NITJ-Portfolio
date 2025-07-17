import express from 'express';
const router = express.Router();
import {getStudentAnalytics,Studentprofileupdate,updateSummerInternTracker,updateOfferTracker} from '../controller/studentanalysis.js';

router.get('/get',getStudentAnalytics);
router.put('/profile-update/:id',Studentprofileupdate);
router.put('/offer-tracker-update/:id', updateOfferTracker);
router.put('/summer-intern-tracker-update/:id', updateSummerInternTracker);

export default router;