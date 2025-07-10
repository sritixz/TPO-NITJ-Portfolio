import express from "express";
const router=express.Router();

import { authenticatemiddleware } from "../utils/authenticate.js";

import {submitContactForm,getContactForms} from "../controller/contactus.js";
import { restrictTo } from "../utils/restrict.js";

router.post("/submit",submitContactForm);
router.get("/get", authenticatemiddleware, restrictTo('Professor'), getContactForms);

export default router;