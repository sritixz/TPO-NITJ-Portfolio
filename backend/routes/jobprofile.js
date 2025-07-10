import express from "express";
const router=express.Router();

import { restrictTo } from "../utils/restrict.js";

import {toggleEditingAllowed,getEditingAllowedStatus,incompletedJobProfile,updateInterviewLink,updategdLink,updateOthersLink, updateoaLink , checkEligibility, getJobProfiletostudent,getJobProfiledetails, getJobsByRecruiter,createJobProfilecopy,updateJob,deleteJob,getJobProfilesForProfessors,approveJobProfile,rejectJobProfile,addshortlistStudents,eligibleinthis,viewshortlisting,getspecificJobProfilesForProfessors, completedJobProfile, getAllCompanies } from "../controller/jobprofile.js";

router.get("/", getAllCompanies);
router.get("/eligibility/:_id/", restrictTo('Student'), checkEligibility);
router.get("/getjobs", restrictTo('Student'), getJobProfiletostudent);


router.post("/createjobcopy", restrictTo('Professor','Recuiter'), createJobProfilecopy);
router.put("/updatejob/:_id", restrictTo('Professor','Recuiter'), updateJob);
router.delete("/deletejob/:_id", restrictTo('Professor','Recuiter'), deleteJob);
router.get("/recruiter/getjobs/:company", restrictTo('Recuiter'), getJobsByRecruiter);


router.get("/professor/getjobs", restrictTo('Professor'), getJobProfilesForProfessors);
router.get("/professor/getjobs/:id", restrictTo('Professor'), getspecificJobProfilesForProfessors);
router.put("/approvejob/:_id", restrictTo('Professor'), approveJobProfile);
router.put("/incompletejob/:_id", restrictTo('Professor'), incompletedJobProfile);
router.put("/completejob/:_id",restrictTo('Professor'), completedJobProfile);
router.put("/rejectjob/:_id", restrictTo('Professor'), rejectJobProfile);
router.post("/add-shortlist-students", restrictTo('Professor'), addshortlistStudents);


router.post("/eligible_students", restrictTo('Professor'),eligibleinthis);
router.post("/shortlisted_students", restrictTo('Professor'),viewshortlisting);
router.post("/set-interview-links", restrictTo('Professor'),updateInterviewLink );
router.post("/set-gd-links", restrictTo('Professor'),updategdLink );
router.post("/set-oa-links", restrictTo('Professor'),updateoaLink );
router.post("/set-others-links", restrictTo('Professor'),updateOthersLink );


router.get("/editing-allowed-status/:company",restrictTo('Professor','Recuiter'),getEditingAllowedStatus );
router.put("/toggle-editing",restrictTo('Professor'),toggleEditingAllowed );


router.get("/:_id", restrictTo('Student','Professor','Recuiter'), getJobProfiledetails);
export default router;