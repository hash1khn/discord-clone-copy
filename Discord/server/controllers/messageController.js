import Message from "../models/Message.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, fileUrl } = req.body;
    const senderId = req.user._id;

    if (!receiverId || (!message && !fileUrl)) {
      return res
        .status(400)
        .json({ message: "Message content or file is required" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver)
      return res.status(404).json({ message: "Receiver not found" });

    // Create and save the message
    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: message?.trim() || "",
      fileUrl: fileUrl || "", // Store uploaded file URL
    });

    // 🔹 Store Notification in DB
    const notification = await Notification.create({
      user: receiverId, // Notification is for receiver
      sender: senderId, // Sender of the message
      type: "message",
      message: `New message from ${req.user.username}: "${message?.slice(
        0,
        30
      )}..."`, // Limit preview
      referenceId: newMessage._id, // Reference to message
    });

    // 🔹 Emit Message & Notification via WebSocket (Real-time)
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const receiverSockets = onlineUsers.get(receiverId) || new Set(); // ✅ Supports multiple sessions

    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit("receiveMessage", newMessage);
      io.to(socketId).emit("receiveNotification", notification);
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
