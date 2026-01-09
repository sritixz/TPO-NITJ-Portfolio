import express from "express";
import {
  createMessage,
  getMessages,
  updateMessage,
  deleteMessage,
} from "../controller/messageController.js";
import { authenticatemiddleware } from "../utils/authenticate.js";
import { restrictTo } from "../utils/restrict.js";

const router = express.Router();

// landing page + admin (same endpoint)
router.get("/",  getMessages);
// admin only
router.post("/", authenticatemiddleware, restrictTo("Admin","Coordinator"), createMessage);
router.put("/:id", authenticatemiddleware, restrictTo("Admin"), updateMessage);
router.delete("/:id", authenticatemiddleware, restrictTo("Admin"), deleteMessage);

export default router;
