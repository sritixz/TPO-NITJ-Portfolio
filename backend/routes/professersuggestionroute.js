import express from 'express';
import { getsuggestions,updatesuggestions,deletesuggestions } from '../controller/suggestioncontroller.js';
const router = express.Router();

router.get("/fetchsuggestions",getsuggestions);
router.patch("/updatesuggestion",updatesuggestions);
router.delete("/deletesuggestion",deletesuggestions);
export default router;