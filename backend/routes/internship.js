import express from "express";
import { getAllInternships, getCombinedInsights, getFilteredInternships, getLastSevenDaysInternships, getInternshipsInsights } from "../controller/internship.js";
const router=express.Router();
import { authenticatemiddleware } from "../utils/authenticate.js";

router.get("/last-seven-days",authenticatemiddleware, getLastSevenDaysInternships);
router.get("/",getAllInternships);
router.get("/filter",getFilteredInternships);
router.get("/insights",getInternshipsInsights);
router.get("/cominsights",getCombinedInsights);

export default router;