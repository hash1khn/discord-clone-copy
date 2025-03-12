import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";
import { sendNotification } from "../utils/notification.js";

const router = express.Router();

router.get("/get-notification", protect, getNotifications); // Get user's notifications
router.patch(
  "/read-notification/:notificationId",
  protect,
  markNotificationAsRead
); // Mark a single notification as read
router.patch("/read-all-notification", protect, markAllNotificationsAsRead); // Mark all notifications as read
router.delete(
  "/delete-notification/:notificationId",
  protect,
  deleteNotification
); // Delete a single notification
router.delete("/delete-all-notification", protect, deleteAllNotifications); // Delete all notifications

router.post("/send-notification", protect, sendNotification); // Send a real-time notification

export default router;
