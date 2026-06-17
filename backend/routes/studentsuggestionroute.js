// import express from 'express';
// import { savesuggestions,recentsuggestions,getContactedCompanies } from '../controller/suggestioncontroller.js';
// const router = express.Router();

// router.post("/suggestions",savesuggestions);
// router.get("/recentsuggestions",recentsuggestions);
// router.get("/contacted", getContactedCompanies);


// export default router;
import express from 'express';
import { 
  savesuggestions, 
  recentsuggestions, 
  getContactedCompanies,
  getsuggestions,      
  updatesuggestions 
} from '../controller/suggestioncontroller.js';

const router = express.Router();

router.post("/suggestions", savesuggestions);
router.get("/recentsuggestions", recentsuggestions);
router.get("/contacted", getContactedCompanies);


router.get("/fetchsuggestions", getsuggestions); 


router.patch("/updatesuggestion", updatesuggestions); 

export default router;