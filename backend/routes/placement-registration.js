import express from 'express';
import { 
  createPlacementRegistration,  
  checkStudentPlacementRegistration,
  getPlacementRegistrationExportData
} from '../controller/placement-registration.js';

import { restrictTo } from "../utils/restrict.js";

const router = express.Router();

router.get('/check', restrictTo('Student'), checkStudentPlacementRegistration);

router.get('/export', restrictTo('Professor'), getPlacementRegistrationExportData);

router.post('/', restrictTo('Student'), createPlacementRegistration);



export default router;