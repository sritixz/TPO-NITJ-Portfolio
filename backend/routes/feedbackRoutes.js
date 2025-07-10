import express from 'express';
import { 
  createFeedback, 
  updateFeedback,
  getFeedback,
  getAllFeedback, 
  getFeedbackByStudent,
  deleteFeedback 
} from '../controller/feedbackController.js';
import { restrictTo } from '../utils/restrict.js';

const router = express.Router();

router.post('/', restrictTo('Recuiter'), createFeedback);
router.put('/', restrictTo('Recuiter'), updateFeedback);
router.get('/get',restrictTo('Recuiter'), getFeedback);
router.get('/',restrictTo('Professor'), getAllFeedback);
router.delete('/:id',restrictTo('Professor'), deleteFeedback);

export default router;