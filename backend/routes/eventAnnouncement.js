import express from 'express';
import { 
  getEventAnnouncements, 
  createEventAnnouncement, updateEventAnnouncement, deleteEventAnnouncement,
  upload 
} from '../controller/EventAnnouncement.js';
// Remove the authenticate import from here to avoid the crash

const router = express.Router();

// Public: GET requests allowed for the landing page
router.get('/', getEventAnnouncements); 

// Note: We don't put authenticate here anymore; 
// we will pass it in server.js instead
router.post('/', upload.single('image'), createEventAnnouncement);
// Add these routes
router.put('/:id',  upload.single('image'), updateEventAnnouncement);
router.delete('/:id',  deleteEventAnnouncement);
export default router;