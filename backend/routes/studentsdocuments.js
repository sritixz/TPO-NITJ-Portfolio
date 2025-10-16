import express from 'express';
import { restrictTo } from '../utils/restrict.js';
import { 
  getStudentDocuments, 
  addStudentDocument, 
  updateStudentDocument, 
  deleteStudentDocument 
} from '../controller/studentsdocuments.js';

const router = express.Router();

// Routes for Student Documents
router.get('/get', getStudentDocuments);
router.post('/add', restrictTo('Admin'), addStudentDocument);
router.put('/update/:id', restrictTo('Admin'), updateStudentDocument);
router.delete('/delete', restrictTo('Admin'), deleteStudentDocument);

export default router;
