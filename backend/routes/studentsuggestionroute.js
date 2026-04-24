import express from 'express';
import { savesuggestions,recentsuggestions,getContactedCompanies } from '../controller/suggestioncontroller.js';
const router = express.Router();

router.post("/suggestions",savesuggestions);
router.get("/recentsuggestions",recentsuggestions);
router.get("/contacted", getContactedCompanies);


export default router;