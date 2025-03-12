import Notification from "../models/Notification.js";

export const sendNotification = async (
  userId,
  senderId,
  type,
  message,
  referenceId
) => {
  try {
    await Notification.create({
      user: userId,
      sender: senderId,
      type,
      message,
      referenceId,
    });
    console.log("✅ Notification sent:", { userId, senderId, type, message });
  } catch (error) {
    console.error("❌ Error sending notification:", error.message);
  }
};
