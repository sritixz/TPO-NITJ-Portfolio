import express from "express";
const router = express.Router();

import multer from "multer";
import path from "path";
import fs from "fs";


import {
  addJobProfile,
  getAllJobProfiles,
  updateJobProfile,
  deleteJobProfile,
  bulkDeleteJobProfiles,
  toggleJobProfileVisibility,
  getAllStudents,
  updateStudentProfile,
  deleteStudentProfiles,
  deactivateStudentProfiles,
  addNewStudent,
  getAllRecruiters,
  updateRecruiterProfile,
  deleteRecruiterProfiles,
  addNewRecruiter,
  getAllProfessors,
  updateProfessorProfile,
  deleteProfessorProfiles,
  addNewProfessor,
  getProfessorById,
} from "../controller/admin.js";

import {
  getAllDepartments,
  updateDepartmentProfile,
  deleteDepartmentProfiles,
  addNewDepartment,
  getDepartmentById,
} from "../controller/Admin/Department.js";

import{
  getAllDevelopers,
  updateDeveloperProfile,
  deleteDeveloperProfiles,
  addNewDeveloper,
} from "../controller/Admin/Devteam.js";

import { getLogs } from "../controller/Admin/Logs.js";

import {
  addLoginAttempt,
  getLoginAttempts,
  getLoginAttempt,
  updateLoginAttempt,
  deleteLoginAttempt,
  deleteBulkLoginAttempts,
} from "../controller/Admin/loginattempt.js";

import {
  addOfferTracker,
  getOfferTrackers,
  getOfferTrackerbyId,
  updateOfferTracker,
  deleteOfferTracker,
  deleteBulkOfferTrackers,
  deleteSpecificOffer,
  updateSpecificOffer,
} from "../controller/Admin/offertracker.js";

import {
  addOffer,
  getOffers,
  getOffer,
  updateOffer,
  deleteOffer,
  deleteBulkOffers,
} from "../controller/Admin/offer.js";

import {
  createAlert,
  getAllAlerts,
  getActiveAlerts,
  updateAlert,
  deleteAlert,
} from "../controller/Admin/alert.js";


import {
  createPlacementCalendar,
  getAllPlacementCalendars,
  getPlacementCalendarById,
  updatePlacementCalendar,
  deletePlacementCalendar,
  deleteManyPlacementCalendars,
  addCompanyToCalendar,
  removeCompanyFromCalendar,
  getUpcomingOrPastCalendars
} from "../controller/Admin/placement-calendar.js";



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/developers";
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + "-" + Date.now() + ext;
    cb(null, name);
  }
});

const upload = multer({ storage });


//job profile routes
router.post("/jobprofiles", addJobProfile);
router.get("/jobprofiles", getAllJobProfiles);
router.put("/jobprofiles/:id", updateJobProfile);
router.delete("/jobprofiles/:id", deleteJobProfile);
router.post("/jobprofiles/bulk-delete", bulkDeleteJobProfiles);
router.put("/jobprofiles/:id/toggle-visibility", toggleJobProfileVisibility);
//student profile routes
router.get("/students", getAllStudents);
router.put("/students/:id",updateStudentProfile);
router.post("/students",addNewStudent);
router.delete("/students", deleteStudentProfiles);
router.patch("/students/deactivate/:id", deactivateStudentProfiles);
//recruiter profile routes
router.get("/recruiters", getAllRecruiters);
router.put("/recruiters/:id",updateRecruiterProfile);
router.post("/recruiters",addNewRecruiter);
router.delete("/recruiters", deleteRecruiterProfiles);
//professor profile routes
router.get("/professors", getAllProfessors);
router.put("/professors/:id",updateProfessorProfile);
router.post("/professors",addNewProfessor);
router.delete("/professors", deleteProfessorProfiles);
router.get("/professors/:id", getProfessorById);
//department profile routes
router.get("/departments", getAllDepartments);
router.put("/departments/:id", updateDepartmentProfile);
router.delete("/departments", deleteDepartmentProfiles);
router.post("/departments", addNewDepartment);
router.get("/departments/:id", getDepartmentById);

//developer profile routes
router.get("/devteam", getAllDevelopers);
router.put("/devteam/:id",upload.single("imageFile"), updateDeveloperProfile);
router.delete("/devteam", deleteDeveloperProfiles);
router.post("/devteam",upload.single("imageFile"), addNewDeveloper);

//logs routes
router.get("/getlogs", getLogs);

//login attempt
router.post("/loginattempts/", addLoginAttempt);
router.get("/loginattempts/", getLoginAttempts);
router.get("/loginattempts/:id", getLoginAttempt);
router.put("/loginattempts/:id", updateLoginAttempt);
router.delete("/loginattempts/:id", deleteLoginAttempt);
router.post("/loginattempts/bulk-delete", deleteBulkLoginAttempts);

//offer tracker
router.post("/offertracker/", addOfferTracker);
router.get("/offertracker/", getOfferTrackers);
router.get("/offertracker/:id", getOfferTrackerbyId);
router.put("/offertracker/:id/offer/:index", updateSpecificOffer);
router.put("/offertracker/:id", updateOfferTracker);
router.delete("/offertracker/:id/offer/:index", deleteSpecificOffer);
router.delete("/offertracker/:id", deleteOfferTracker);
router.post("/offertracker/bulk-delete", deleteBulkOfferTrackers);

//offer
router.post("/offers/", addOffer);
router.get("/offers/", getOffers);
router.get("/offers/:id", getOffer);
router.put("/offers/:id", updateOffer);
router.delete("/offers/:id", deleteOffer);
router.post("/offers/bulk-delete", deleteBulkOffers);


//alert
router.post("/alert/", createAlert);
router.get("/alert/", getAllAlerts);
router.get("/alert/active", getActiveAlerts);
router.put("/alert/:id", updateAlert);
router.delete("/alert/:id", deleteAlert);


//placement calendar
router.post("/placement-calendar/", createPlacementCalendar);
router.get("/placement-calendar/", getAllPlacementCalendars);
router.get("/placement-calendar/filter", getUpcomingOrPastCalendars);
router.get("/placement-calendar/:id", getPlacementCalendarById);
router.put("/placement-calendar/:id", updatePlacementCalendar);
router.delete("/placement-calendar/:id", deletePlacementCalendar);
router.post("/placement-calendar/delete-many", deleteManyPlacementCalendars);
router.post("/placement-calendar/add-company/:date", addCompanyToCalendar);
router.delete("/placement-calendar/remove-company/:date/:companyId", removeCompanyFromCalendar);

export default router;