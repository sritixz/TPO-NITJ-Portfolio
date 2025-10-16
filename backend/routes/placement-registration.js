import express from 'express';
import { 
  createPlacementRegistration,  
  checkStudentPlacementRegistration,
  getPlacementRegistrationExportData,
  createDeadline,
  editDeadline,
  checkopen,
  editPlacementRegistration,
} from '../controller/placement-registration.js';

import { restrictTo } from "../utils/restrict.js";

const router = express.Router();

router.get('/join-whatsapp', (req, res) => {
  const whatsappUrl = "https://chat.whatsapp.com/HfRgPTJE2tSGNZ2i6YBJd8";
  return res.redirect(302, whatsappUrl);
});



router.post('/create-deadline', restrictTo('Professor'), createDeadline);
router.put('/deadline/:id', restrictTo('Professor'), editDeadline);
router.get('/checkopen', restrictTo('Student','Professor'), checkopen);

router.get('/check', restrictTo('Student'), checkStudentPlacementRegistration);

router.get('/export', restrictTo('Professor'), getPlacementRegistrationExportData);

router.post('/', restrictTo('Student'), createPlacementRegistration);
router.put('/edit', restrictTo('Student'), editPlacementRegistration);



export default router;