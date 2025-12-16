import express from "express";
import { createCompanyFeedback, deleteCompanyFeedback, getAllCompanyFeedbacks } from "../controller/companyFeedback.js";
import { restrictTo } from "../utils/restrict.js";
import logMiddleware from "../utils/logs.js";
import { authenticatemiddleware } from "../utils/authenticate.js";
const router=express.Router();


router.get("/", getAllCompanyFeedbacks);
router.post("/", createCompanyFeedback);
router.post("/delete/:id", authenticatemiddleware, restrictTo("Professor"), logMiddleware, deleteCompanyFeedback )

export default router;