import express from 'express';
const router = express.Router();
import {restrictTo} from '../utils/restrict.js';

import { sendWithdrawOtp,verifyWithdrawOtp} from '../controller/withdraw.js';

router.post('/send-otp', restrictTo('Student'),sendWithdrawOtp);
router.post('/verify-otp', restrictTo('Student'),verifyWithdrawOtp);

export default router;