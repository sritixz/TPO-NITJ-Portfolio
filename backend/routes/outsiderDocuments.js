import express from 'express';
import { restrictTo } from '../utils/restrict.js';
import { getDocumentsOutsider, addDocumentOutsider, updateDocumentOutsider, deleteDocumentOutsider } from '../controller/outsource-internship/documentOutsider.js';

const router = express.Router();


//Documents
router.get('/get', getDocumentsOutsider);
router.post('/add', restrictTo('Admin'), addDocumentOutsider);
router.put('/update/:id', restrictTo('Admin'), updateDocumentOutsider);
router.delete('/delete', restrictTo('Admin'), deleteDocumentOutsider);

export default router;