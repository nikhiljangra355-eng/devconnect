import express from "express";
import { getMessages } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:userId/messages", protect, getMessages);

export default router;
