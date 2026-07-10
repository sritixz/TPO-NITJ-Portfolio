import express from "express";
const router = express.Router();

import SummerIntern from "../../models/summer_internship.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getAllSummerInternTrackers, removeStudentFromTracker } from "../../controller/Admin/summer_intern_tracker.js";
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
  getJobProfileDetails,
  addAppliedStudent,
  removeAppliedStudent,
  addFinalShortlisted,
  removeFinalShortlisted,
  moveStudentForward,
  bulkUpdatePlacementInterest,
// } from "../controller/admin.js";
// =======
  getDatabaseRecords,
} from "../../controller/admin.js";

import {
  getAllDepartments,
  updateDepartmentProfile,
  deleteDepartmentProfiles,
  addNewDepartment,
  getDepartmentById,
} from "../../controller/Admin/Department.js";

// Re-integrated your Faculty logic imports
import { 
  getAllFaculties, 
  addNewFaculty, 
  updateFacultyProfile, 
  deleteFacultyProfiles,
  uploadFacultiesExcel, 
  updateExistingFaculties 
} from "../../controller/Admin/Faculty.js";

import {
  getAllDevelopers,
  updateDeveloperProfile,
  deleteDeveloperProfiles,
  addNewDeveloper,
} from "../../controller/Admin/Devteam.js";

import { getLogs } from "../../controller/Admin/Logs.js";

import {
  addLoginAttempt,
  getLoginAttempts,
  getLoginAttempt,
  updateLoginAttempt,
  deleteLoginAttempt,
  deleteBulkLoginAttempts,
} from "../../controller/Admin/loginattempt.js";

import {
  addOfferTracker,
  getOfferTrackers,
  getOfferTrackerbyId,
  updateOfferTracker,
  deleteOfferTracker,
  deleteBulkOfferTrackers,
  deleteSpecificOffer,
  updateSpecificOffer,
} from "../../controller/Admin/offertracker.js";

import {
  addOffer,
  getOffers,
  getOffer,
  updateOffer,
  deleteOffer,
  deleteBulkOffers,
  addStudentToOffer,
  updateStudentInOffer,
  deleteStudentFromOffer
} from "../../controller/Admin/offer.js";

import {
<<<<<<< HEAD
  getPlacementSettings,
  updatePlacementSettings,
  toggle7thSem1_5x,
} from "../../controller/Admin/placementSettings.js";

import {
=======
>>>>>>> 95a9aacb050b56a2207ab2e65cacc9af1e91bbc2
  createAlert,
  getAllAlerts,
  getActiveAlerts,
  updateAlert,
  deleteAlert,
} from "../../controller/Admin/alert.js";

import {
  createPlacementCalendar,
  getAllPlacementCalendars,
  getPlacementCalendarById,
  updatePlacementCalendar,
  deletePlacementCalendar,
  deleteManyPlacementCalendars,
  addCompanyToCalendar,
  removeCompanyFromCalendar,
  getUpcomingOrPastCalendars,
} from "../../controller/Admin/placement-calendar.js";

import {
  createPlacementRegistration,
  getAllPlacementRegistrations,
  getPlacementRegistrationById,
  updatePlacementRegistration,
  deletePlacementRegistration,
  deleteManyPlacementRegistrations,
} from "../../controller/Admin/placement-registration.js";

import { uploadExcel } from "../../utils/adminMulter.js";
import { uploadStudentsExcel, updateExistingStudents } from "../../controller/Admin/studentExcelUpload.js";
import { getERPData } from "../../controller/Admin/erpData.js";

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
  },
});

const upload = multer({ storage });

// Re-added your memory storage for Faculty Excel uploads
const excelMemoryStorage = multer.memoryStorage();
const uploadExcelMemory = multer({ storage: excelMemoryStorage });

// Job profile routes
router.post("/jobprofiles", addJobProfile);
router.get("/jobprofiles", getAllJobProfiles);
router.put("/jobprofiles/:id", updateJobProfile);
router.delete("/jobprofiles/:id", deleteJobProfile);
router.post("/jobprofiles/bulk-delete", bulkDeleteJobProfiles);
router.put("/jobprofiles/:id/toggle-visibility", toggleJobProfileVisibility);

// Sir's latest Job Profile management routes
router.get("/jobprofiles/:id/details",  getJobProfileDetails);
router.post("/jobprofiles/:id/applied/add",  addAppliedStudent);
router.delete("/jobprofiles/:id/applied/remove",  removeAppliedStudent);
router.post("/jobprofiles/:id/final/add",  addFinalShortlisted);
router.delete("/jobprofiles/:id/final/remove",  removeFinalShortlisted);
router.post("/jobprofiles/move-forward",  moveStudentForward);

// Student profile routes
router.get("/students", getAllStudents);
router.put("/students/:id", updateStudentProfile);
router.post("/students", addNewStudent);
router.delete("/students", deleteStudentProfiles);
router.patch("/students/deactivate/:id", deactivateStudentProfiles);
router.post(
  "/students/excel/upload-excel",
  uploadExcel.single("file"),
  uploadStudentsExcel
);
router.put("/students/excel/update-existing", updateExistingStudents);
// Sir's latest Placement Interest route
router.put("/students/placementInterest/update", bulkUpdatePlacementInterest);

// Recruiter profile routes
router.get("/recruiters", getAllRecruiters);
router.put("/recruiters/:id", updateRecruiterProfile);
router.post("/recruiters", addNewRecruiter);
router.delete("/recruiters", deleteRecruiterProfiles);

// Professor profile routes
router.get("/professors", getAllProfessors);
router.put("/professors/:id", updateProfessorProfile);
router.post("/professors", addNewProfessor);
router.delete("/professors", deleteProfessorProfiles);
router.get("/professors/:id", getProfessorById);  

// Re-integrated your Faculty Management Routes
router.get("/faculties", getAllFaculties);
router.post("/faculties", addNewFaculty);
router.put("/faculties/:id", updateFacultyProfile);
router.delete("/faculties", deleteFacultyProfiles);
router.post(
  "/faculties/excel/upload-excel", 
  uploadExcelMemory.single("file"), 
  uploadFacultiesExcel
);
router.put("/faculties/excel/update-existing", updateExistingFaculties);

// Department profile routes
router.get("/departments", getAllDepartments);
router.put("/departments/:id", updateDepartmentProfile);
router.delete("/departments", deleteDepartmentProfiles);
router.post("/departments", addNewDepartment);
router.get("/departments/:id", getDepartmentById);

// Developer profile routes
router.get("/devteam", getAllDevelopers);
router.put("/devteam/:id", upload.single("imageFile"), updateDeveloperProfile);
router.delete("/devteam", deleteDeveloperProfiles);
router.post("/devteam", upload.single("imageFile"), addNewDeveloper);

// Logs routes
router.get("/getlogs", getLogs);

// Login attempt
router.post("/loginattempts/", addLoginAttempt);
router.get("/loginattempts/", getLoginAttempts);
router.get("/loginattempts/:id", getLoginAttempt);
router.put("/loginattempts/:id", updateLoginAttempt);
router.delete("/loginattempts/:id", deleteLoginAttempt);
router.post("/loginattempts/bulk-delete", deleteBulkLoginAttempts);

// Offer tracker
router.post("/offertracker/", addOfferTracker);
router.get("/offertracker/", getOfferTrackers);
router.get("/offertracker/:id", getOfferTrackerbyId);
router.put("/offertracker/:id/offer/:index", updateSpecificOffer);
router.put("/offertracker/:id", updateOfferTracker);
router.delete("/offertracker/:id/offer/:index", deleteSpecificOffer);
router.delete("/offertracker/:id", deleteOfferTracker);
router.post("/offertracker/bulk-delete", deleteBulkOfferTrackers);

// Offer
router.post("/offers/", addOffer);
router.get("/offers/", getOffers);
router.get("/offers/:id", getOffer);
router.put("/offers/:id", updateOffer);
router.delete("/offers/:id", deleteOffer);
router.post("/offers/bulk-delete", deleteBulkOffers);
router.post("/offers/:offerId/add-student", addStudentToOffer);
router.put("/offers/:offerId/student/:studentId", updateStudentInOffer);
router.delete("/offers/:offerId/student/:studentId", deleteStudentFromOffer);

// Alert
router.post("/alert/", createAlert);
router.get("/alert/", getAllAlerts);
router.get("/alert/active", getActiveAlerts);
router.put("/alert/:id", updateAlert);
router.delete("/alert/:id", deleteAlert);

// Placement calendar
router.post("/placement-calendar/", createPlacementCalendar);
router.get("/placement-calendar/", getAllPlacementCalendars);
router.get("/placement-calendar/filter", getUpcomingOrPastCalendars);
router.get("/placement-calendar/:id", getPlacementCalendarById);
router.put("/placement-calendar/:id", updatePlacementCalendar);
router.delete("/placement-calendar/:id", deletePlacementCalendar);
router.post("/placement-calendar/delete-many", deleteManyPlacementCalendars);
router.post("/placement-calendar/add-company/:date", addCompanyToCalendar);
router.delete(
  "/placement-calendar/remove-company/:date/:companyId",
  removeCompanyFromCalendar
);

// Placement registration
router.post("/placement-registration/", createPlacementRegistration);
router.get("/placement-registration/", getAllPlacementRegistrations);
router.get("/placement-registration/:id", getPlacementRegistrationById);
router.put("/placement-registration/:id", updatePlacementRegistration);
router.delete("/placement-registration/:id", deletePlacementRegistration);
router.delete(
  "/placement-registration/delete-many/",
  deleteManyPlacementRegistrations
);


//summerInterntracker

router.get("/summerInternTracker", getAllSummerInternTrackers);
router.delete("/summerInternTracker/:docId/student/:studentId", removeStudentFromTracker);


//summer Intern
/* ================= GET ALL ================= */
router.get("/summerIntern", async (req, res) => {
  const data = await SummerIntern.find().lean();
  res.json(data);
});

/* ================= GET SINGLE ================= */
router.get("/summerIntern/:id", async (req, res) => {
  const data = await SummerIntern.findById(req.params.id).lean();
  res.json(data);
});

/* ================= CREATE ================= */
router.post("/summerIntern", async (req, res) => {
  const intern = await SummerIntern.create(req.body);
  res.json(intern);
});

/* ================= UPDATE VISIBILITY ================= */
router.put("/summerIntern/:id", async (req, res) => {
  const updated = await SummerIntern.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

/* ================= DELETE WHOLE INTERN OFFER ================= */
router.delete("/summerIntern/:id", async (req, res) => {
  await SummerIntern.findByIdAndDelete(req.params.id);
  res.json({ message: "Summer Intern Offer Deleted" });
});

/* ================= ADD STUDENT ================= */
router.post("/summerIntern/:id/add-student", async (req, res) => {
  const intern = await SummerIntern.findById(req.params.id);
  intern.shortlisted_students.push(req.body);
  await intern.save();
  res.json(intern);
});

/* ================= UPDATE STUDENT ================= */
router.put("/summerIntern/:id/student/:studentId", async (req, res) => {
  const intern = await SummerIntern.findById(req.params.id);

  const student = intern.shortlisted_students.id(req.params.studentId);
  Object.assign(student, req.body);

  await intern.save();
  res.json(intern);
});

/* ================= DELETE PARTICULAR STUDENT ================= */
router.delete("/summerIntern/:id/student/:studentId", async (req, res) => {
  const intern = await SummerIntern.findById(req.params.id);

  intern.shortlisted_students =
    intern.shortlisted_students.filter(
      (s) => s._id.toString() !== req.params.studentId
    );

  await intern.save();
  res.json({ message: "Student Removed" });
});


router.get("/database/:collectionName/", getDatabaseRecords);
// ERP Data route (Sir's latest)
router.get("/erp/student", getERPData);

<<<<<<< HEAD
// ========== Placement Settings Routes ==========
// Get current placement settings
router.get("/placement-settings", getPlacementSettings);

// Update placement settings
router.put("/placement-settings", updatePlacementSettings);

// Toggle 7th Sem 1.5x setting
router.post("/placement-settings/toggle-7th-sem-1-5x", toggle7thSem1_5x);

=======
>>>>>>> 95a9aacb050b56a2207ab2e65cacc9af1e91bbc2
export default router;