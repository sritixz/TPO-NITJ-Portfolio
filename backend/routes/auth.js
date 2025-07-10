import express from "express";
const router=express.Router();

import {LockedResendOTP,LockedverifyOTP,sendResetPasswordOtp,verifyResetPasswordOtp,resetPassword,login,logout} from "../controller/auth.js";

router.post("/login",login);
router.post('/logout',logout);
router.post('/send-resetpassword-otp',sendResetPasswordOtp);
router.post('/verify-resetpassword-otp',verifyResetPasswordOtp);
router.post('/locked-verify-otp',LockedverifyOTP);
router.post('/locked-resend-otp',LockedResendOTP);
router.post('/reset-password',resetPassword);

export default router;