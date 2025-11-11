import express from "express";
import {
  getActiveAlerts,
} from "../controller/alert.js";

const router = express.Router();

router.get("/active", getActiveAlerts);

export default router;
