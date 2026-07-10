<<<<<<< HEAD
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

=======
import express from 'express';
import { savesuggestions,recentsuggestions,getContactedCompanies } from '../controller/suggestioncontroller.js';
const router = express.Router();

router.post("/suggestions",savesuggestions);
router.get("/recentsuggestions",recentsuggestions);
router.get("/contacted", getContactedCompanies);


>>>>>>> 95a9aacb050b56a2207ab2e65cacc9af1e91bbc2
export default router;