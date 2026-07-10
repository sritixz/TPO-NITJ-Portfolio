import express from "express";
const router = express.Router();

import {
    approveJAF,
    createJobAnnouncementForm,
    createPublicJobAnnouncementForm,
    getjaf,
    rejectJAF,
    updateJAF
} from "../controller/jaf.js";
import { sendOtp, verifyOtp } from "../controller/otp.js";
import { restrictTo } from "../utils/restrict.js";



// 0. OTP ROUTES - Public, used to verify HR email before public-create is allowed
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// 1. PUBLIC ROUTE - Ispe koi token nahi chahiye, Postman se direct chalega!
// NOTE: requires the httpOnly `jafEmailVerified` cookie set by /verify-otp above.
router.post("/public-create", createPublicJobAnnouncementForm);

// 2. PROTECTED ROUTES - Inpar restrict ya check lagana ho toh dashboard ke liye:
router.post("/create", createJobAnnouncementForm);
router.get("/get",restrictTo('Professor','Recuiter'),getjaf);
router.put("/approvejaf/:_id", restrictTo('Professor'), approveJAF);
router.delete("/rejectjaf/:_id", restrictTo('Professor', 'Recuiter'), rejectJAF);
router.put("/updatejaf/:_id", restrictTo('Professor', 'Recuiter'), updateJAF);

export default router;