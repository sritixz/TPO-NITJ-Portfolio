import express from "express";
const router=express.Router();

import {
    approveJAF,
    createJobAnnouncementForm,getjaf,
    rejectJAF,
    updateJAF
    } from "../controller/jaf.js";
import { restrictTo } from "../utils/restrict.js";

router.post("/create",restrictTo('Professor','Recuiter'), createJobAnnouncementForm);
router.get("/get",restrictTo('Professor','Recuiter'),getjaf);
router.put("/approvejaf/:_id",restrictTo('Professor'), approveJAF);
router.put("/rejectjaf/:_id", restrictTo('Professor'), rejectJAF);
router.put("/updatejaf/:_id", restrictTo('Professor','Recuiter'), updateJAF);

export default router;