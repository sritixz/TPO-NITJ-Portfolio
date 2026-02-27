import express from "express";
import {
  addOrUpdatePlacementEntry,
  editCompanyProcess,
  deleteCompanyProcess,
  deleteAllCompanyProcesses,
  getPlacementsByMonth,
  setDayStatus
} from "../controller/placement-calendar.js";
import { restrictTo } from "../utils/restrict.js";

const router = express.Router();

router.post("/", restrictTo('Professor'), addOrUpdatePlacementEntry); // Add/Update a date
router.put("/:date/edit", restrictTo('Professor'), editCompanyProcess); // Edit one company process
router.put("/:date/dayStatus", restrictTo('Professor'),  setDayStatus ); // Edit one company process
router.delete("/:date/company/:companyId", restrictTo('Professor'), deleteCompanyProcess); // Delete one company process
router.delete("/:date/all", restrictTo('Professor'), deleteAllCompanyProcesses); // Delete all company processes of a date
router.get("/:month/:year", restrictTo('Professor','Student', 'Faculty'), getPlacementsByMonth); // Fetch by month & year

export default router;
