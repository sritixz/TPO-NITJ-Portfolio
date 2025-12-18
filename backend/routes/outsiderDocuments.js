import express from 'express';
import { restrictTo } from '../utils/restrict.js';
import { getDocumentsOutsider, addDocumentOutsider, updateDocumentOutsider, deleteDocumentOutsider } from '../controller/outsource-internship/documentOutsider.js';

const router = express.Router();


//Documents
router.get('/get', getDocumentsOutsider);
router.post('/add', addDocumentOutsider);
router.put('/update/:id', updateDocumentOutsider);
router.delete('/delete', deleteDocumentOutsider);

export default router;