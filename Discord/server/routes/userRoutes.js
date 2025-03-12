import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  getUserProfileById,
  getUserProfile,
  updateUserProfile,
  searchUsers,
  sendFriendRequest,
  handleFriendRequest,
  removeFriend,
} from "../controllers/userController.js";

const router = express.Router();

// 🔹 User Profile Routes
router.get("/get-profile-by-id/:userId", protect, getUserProfileById);

router.get("/get-profile", protect, getUserProfile);

router.put(
  "/update-profile",
  protect,
  upload.single("file"),
  updateUserProfile
);

// 🔹 Search Users
router.get("/search-profile/:query", protect, searchUsers);

// 🔹 Friend Requests & Management
router.post("/friend-request/send/:receiverId", protect, sendFriendRequest);
router.post("/friend-request/handle/:requestId", protect, handleFriendRequest); // Accept/Reject
router.delete("/remove-friend/:friendId", protect, removeFriend);

export default router;
