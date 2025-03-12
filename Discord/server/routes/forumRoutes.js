import express from "express";
import {
  createForum,
  getForums,
  getForum,
  joinForum,
  leaveForum,
  deleteForum,
} from "../controllers/forumController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-forum", protect, createForum);       // Create Forum
router.get("/get-all-forum/", getForums);                   // Get All Forums
router.get("/get-forum/:forumId", getForum);            // Get Single Forum
router.post("/join/:forumId", protect, joinForum); // Join Forum
router.post("/leave/:forumId", protect, leaveForum); // Leave Forum
router.delete("/delete/:forumId", protect, deleteForum); // Delete Forum (Owner Only)

export default router;
