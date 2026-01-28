import express from "express";
import { hardRefreshERPData } from "../controller/hardRefreshERPData.js";
const router=express.Router();

router.get("/", hardRefreshERPData);

export default router;