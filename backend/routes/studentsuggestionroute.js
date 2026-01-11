import express from 'express';
import { savesuggestions,recentsuggestions } from '../controller/suggestioncontroller.js';
const router = express.Router();

router.post("/suggestions",savesuggestions);
router.get("/recentsuggestions",recentsuggestions);


export default router;