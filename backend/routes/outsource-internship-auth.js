import express from 'express';
import { checkOutsiderEmail, handleLoginOutsider, handleOTPGeneration, handleSignUp, verifyOutsiderOtp } from '../controller/outsource-internship/auth.js';
const router = express.Router();

//authentication
router.post('/emailVerification', handleOTPGeneration)
router.post('/verifyOtp', verifyOutsiderOtp)
router.post('/signup', handleSignUp)
router.post('/login', handleLoginOutsider)
router.get('/checkEmail', checkOutsiderEmail)

export default router;