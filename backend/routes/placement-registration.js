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
import Student from '../models/user_model/student.js';

const router = express.Router();

router.get('/join-whatsapp', async (req, res) => {
  const id = req.user.userId
  const response = await Student.findById(id)
  // console.log(response)
  if(response.batch === '2027' && response.course === 'B.Tech')
  {
    const whatsappUrl = "https://chat.whatsapp.com/BHgx4igkwVgDvlNyxCncQ8";
    return res.redirect(302, whatsappUrl);
  }
  if(response.batch === '2028' && response.course === 'B.Tech')
  {
    const whatsappUrl = "https://chat.whatsapp.com/C7YBBdtWK4hGWZkLw0EtI6";
    return res.redirect(302, whatsappUrl);
  }
  if(response.batch === '2027' && response.course === 'MBA')
  {
    const whatsappUrl = "https://chat.whatsapp.com/KPkAIaEHXTq88VQ11FwGaz?mode=gi_t";
    return res.redirect(302, whatsappUrl);
  }
  if(response.batch === '2027' && response.course === 'M.Sc.')
  {
    const whatsappUrl = "https://chat.whatsapp.com/JZo7SR8y5O38A9uAD0mBdQ?mode=gi_t";
    return res.redirect(302, whatsappUrl);
  }
});

router.post('/create-deadline', restrictTo('Professor'), createDeadline);
router.put('/deadline/:id', restrictTo('Professor'), editDeadline);
router.get('/checkopen', restrictTo('Student','Professor'), checkopen);

router.get('/check', restrictTo('Student'), checkStudentPlacementRegistration);

router.get('/export', restrictTo('Professor', 'Faculty'), getPlacementRegistrationExportData);

router.post('/', restrictTo('Student'), createPlacementRegistration);
router.put('/edit', restrictTo('Student'), editPlacementRegistration);



export default router;