import express from "express";
import {
  getProfile,
  listDevelopers,
  toggleFollow,
  updateProfile
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", protect, listDevelopers);
router.get("/:id", protect, getProfile);
router.put("/me", protect, upload.single("profilePicture"), updateProfile);
router.post("/:id/follow", protect, toggleFollow);

export default router;
