import express from "express";
const router=express.Router();

import multer from "multer";
import path from "path";
import { existsSync, mkdirSync } from 'fs';

import { restrictTo } from "../utils/restrict.js";

import {addfinalshortlistStudent,finalshortlisteligible,toggleEditingAllowed,getEditingAllowedStatus,incompletedJobProfile,updateInterviewLink,updategdLink,updateOthersLink, updateoaLink , checkEligibility, getJobProfiletostudent,getJobProfiledetails, getJobsByRecruiter,createJobProfilecopy, uploadAttachment,deleteAttachment,updateJob,deleteJob,getJobProfilesForProfessors,approveJobProfile,rejectJobProfile,addshortlistStudents,eligibleinthis,viewshortlisting,getspecificJobProfilesForProfessors, completedJobProfile, getAllCompanies, sendStepEmail, markJobPending, updateJobStatus } from "../controller/jobprofile.js";



const uploadDir = path.join(process.cwd(), 'uploads', 'job_attachments');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Assuming uploads folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.get("/", getAllCompanies);
router.get("/eligibility/:_id/", restrictTo('Student'), checkEligibility);
router.get("/getjobs", restrictTo('Student'), getJobProfiletostudent);


router.post("/createjobcopy", restrictTo('Professor','Recuiter'), createJobProfilecopy);
router.post("/upload-attachment/:jobId", restrictTo('Professor','Recuiter'), upload.single('attachment') , uploadAttachment);
router.post("/send-step-email/:jobId/:stepIndex", restrictTo('Professor'), upload.array('files'), sendStepEmail);
router.delete("/delete-attachment/:jobId/:attachmentId", restrictTo('Professor','Recuiter'), deleteAttachment);
router.put("/updatejob/:_id", restrictTo('Professor','Recuiter'), updateJob);
router.delete("/deletejob/:_id", restrictTo('Professor','Recuiter'), deleteJob);
router.get("/recruiter/getjobs/:company", restrictTo('Recuiter'), getJobsByRecruiter);


router.get("/professor/getjobs", restrictTo('Professor','Faculty'), getJobProfilesForProfessors);
router.get("/professor/getjobs/:id", restrictTo('Professor,Faculty'), getspecificJobProfilesForProfessors);
router.put("/approvejob/:_id", restrictTo('Professor'), approveJobProfile);
router.put("/incompletejob/:_id", restrictTo('Professor'), incompletedJobProfile);
router.put("/completejob/:_id",restrictTo('Professor'), completedJobProfile);
router.put("/pendingjob/:_id",restrictTo('Professor'), markJobPending);
router.put("/status/:jobId",restrictTo('Professor'), updateJobStatus);
router.put("/rejectjob/:_id", restrictTo('Professor'), rejectJobProfile);
router.post("/add-shortlist-students", restrictTo('Professor'), addshortlistStudents);
router.post("/add-final-shortlist-students", restrictTo('Professor'), addfinalshortlistStudent);


router.post("/eligible_students", restrictTo('Professor'),eligibleinthis);
router.post("/final_eligible_students", restrictTo('Professor'),finalshortlisteligible);
router.post("/shortlisted_students", restrictTo('Professor'),viewshortlisting);
router.post("/set-interview-links", restrictTo('Professor'),updateInterviewLink );
router.post("/set-gd-links", restrictTo('Professor'),updategdLink );
router.post("/set-oa-links", restrictTo('Professor'),updateoaLink );
router.post("/set-others-links", restrictTo('Professor'),updateOthersLink );


router.get("/editing-allowed-status/:company",restrictTo('Professor','Recuiter'),getEditingAllowedStatus );
router.put("/toggle-editing",restrictTo('Professor'),toggleEditingAllowed );


router.get("/:_id", restrictTo('Student','Professor','Recuiter'), getJobProfiledetails);
export default router;