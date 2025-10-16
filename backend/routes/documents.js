import express from 'express';
import { restrictTo } from '../utils/restrict.js';
import { getDocuments, addDocument, updateDocument, deleteDocument } from '../controller/documents.js';

const router = express.Router();


router.get('/get', getDocuments);
router.post('/add', restrictTo('Admin'), addDocument);
router.put('/update/:id', restrictTo('Admin'), updateDocument);
router.delete('/delete', restrictTo('Admin'), deleteDocument);

export default router;