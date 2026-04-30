import express from 'express';
import {
  checkapplicationformtemplateexists,
  createFormTemplate,
  deleteFormTemplate,
  getFormTemplate,
  updateFormTemplate,
  getStudent
} from '../controller/template.js';
import {
  submitForm,
  getFormSubmissions,
  getFormSubmissionstorecruiter,
  deleteFormSubmission,
  deleteAllFormSubmissions,
  makeVisible,
  withdrawApplication,
  editApplication,
  getSubmissionbystudent 
} from '../controller/formsubmission.js';


import {
  gdrive
} from '../controller/googledrive.js'
import upload from '../utils/multer.js'

import { restrictTo } from '../utils/restrict.js';

const router = express.Router();

// for recruiter and recruiter
router.get('/check-aft-exist/:jobId',restrictTo('Professor'),checkapplicationformtemplateexists);
router.post('/form-templates',restrictTo('Professor'), createFormTemplate); // Recruiter and tpo creates template
router.put('/delete-form-template/:jobId', restrictTo('Professor'), deleteFormTemplate);
router.put('/form-templates/:jobId',restrictTo('Professor'), updateFormTemplate); // TPO configures auto-fill


// for student
router.get('/form-templates/:jobId',restrictTo('Student','Professor'), getFormTemplate); // Fetch specific form template
router.get('/students',restrictTo('Student'), getStudent);
router.post('/form-submissions',restrictTo('Student'), submitForm);
router.post('/upload-resume', upload.single('file'), gdrive);


//professor form template edit, delete, create


//professor form submission
router.get('/form-submissions/:jobId',restrictTo('Professor','Recuiter','Faculty'), getFormSubmissions);
router.delete('/form-submissions/:id', restrictTo('Professor'), deleteFormSubmission);
router.delete('/form-submissions/delete-all/:jobId', restrictTo('Professor'), deleteAllFormSubmissions);
router.patch('/form-submissions/make-visible/:jobId', restrictTo('Professor'), makeVisible);

//recruiter form submission
router.get('/form-submissions/recruiter/:jobId',restrictTo('Professor','Recuiter'), getFormSubmissionstorecruiter);


router.post('/withdraw',restrictTo('Student'), withdrawApplication);
router.put('/edit',restrictTo('Student'), editApplication);
router.get('/get-already/:jobId', restrictTo('Student'), getSubmissionbystudent);

export default router;
