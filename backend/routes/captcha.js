import express from "express";
const router=express.Router();

import { generateCaptcha,verifyCaptcha} from "../controller/captchaController.js";

router.get("/generate", generateCaptcha);
router.post("/verify", verifyCaptcha);

export default router;

