import express from 'express';
import { checkOutsiderEmail, handleLoginOutsider, handleOTPGeneration, handleSignUp, verifyOutsiderOtp, sendResetPasswordOtp, verifyResetPasswordOtp, resetPassword } from '../controller/outsource-internship/auth.js';
const router = express.Router();

//authentication
router.post('/emailVerification', handleOTPGeneration)
router.post('/verifyOtp', verifyOutsiderOtp)
router.post('/signup', handleSignUp)
router.post('/login', handleLoginOutsider)
router.get('/checkEmail', checkOutsiderEmail)
router.post('/send-resetpassword-otp', sendResetPasswordOtp)
router.post('/verify-resetpassword-otp', verifyResetPasswordOtp)
router.post('/reset-password', resetPassword)

export default router;