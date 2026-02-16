import express from "express";
const router = express.Router();

// Import existing controllers
import { savesuggestions, recentsuggestions } from "../controller/suggestionController.js";

// Use the restrictTo and log middleware
import { restrictTo } from "../utils/restrict.js";
import { logMiddleware } from "../utils/logs.js";

// Faculty Suggestion Submission
router.post("/suggestion", restrictTo('Faculty'), logMiddleware, savesuggestions);

// NEW: Faculty Private History Route
// This ensures they only see their own suggestions, mirroring the Student logic
router.get("/my-suggestions", restrictTo('Faculty'), logMiddleware, recentsuggestions);

export default router;