// import express from 'express';
// import { validateCgpa } from '../controller/cgpaChecker.js';

// const router = express.Router();

// router.post('/validate-cgpa', validateCgpa);


// export default router;



import express from 'express';
import multer from 'multer';
import { validateCgpa } from '../controller/cgpaChecker.js';

const router = express.Router();
const upload = multer();

router.post('/validate-cgpa', upload.single('file'), validateCgpa);

export default router;
