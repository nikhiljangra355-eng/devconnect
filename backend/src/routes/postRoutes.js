import express from "express";
import {
  addComment,
  createPost,
  deletePost,
  getFeed,
  toggleBookmark,
  toggleLike,
  updatePost
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getFeed).post(protect, upload.single("image"), createPost);
router.route("/:id").put(protect, updatePost).delete(protect, deletePost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/bookmark", protect, toggleBookmark);
router.post("/:id/comments", protect, addComment);

export default router;
