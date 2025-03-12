import Forum from "../models/Forum.js";
import mongoose from "mongoose";

// ✅ Get All Forums
export const getForums = async (req, res) => {
  try {
    const forums = await Forum.find()
      .populate("owner", "username handle")
      .populate("admins", "username handle")
      .populate("members", "username handle");

    res.status(200).json(forums);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching forums", error: error.message });
  }
};

// ✅ Get a Single Forum
export const getForum = async (req, res) => {
  try {
    const { forumId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(forumId)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }

    const forum = await Forum.findById(forumId)
      .populate("owner", "username handle")
      .populate("admins", "username handle")
      .populate("members", "username handle");

    if (!forum) return res.status(404).json({ message: "Forum not found" });

    res.status(200).json(forum);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Create Forum (With Notification)
export const createForum = async (req, res) => {
  try {
    const { name, handle, description } = req.body;

    if (!name || !handle) {
      return res
        .status(400)
        .json({ message: "Forum name and handle are required" });
    }

    const existingForum = await Forum.findOne({ handle });
    if (existingForum) {
      return res.status(400).json({ message: "Forum handle already exists" });
    }

    const forum = await Forum.create({
      name,
      handle,
      description: description || "",
      owner: req.user._id,
      admins: [req.user._id], // Owner is admin by default
      members: [req.user._id], // Owner is a member too
    });

    res.status(201).json({ message: "Forum created successfully", forum });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Join a Forum (With Notification)
export const joinForum = async (req, res) => {
  try {
    const { forumId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(forumId)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }

    const forum = await Forum.findById(forumId);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    if (forum.members.includes(req.user._id)) {
      return res.status(400).json({ message: "You are already a member" });
    }

    forum.members.push(req.user._id);
    await forum.save();

    // 🔹 Notify forum admins
    const notifications = forum.admins.map((adminId) => ({
      user: adminId,
      sender: req.user._id,
      type: "forum_join",
      message: `${req.user.username} joined the forum "${forum.name}".`,
      referenceId: forum._id,
    }));

    await Notification.insertMany(notifications);

    // 🔹 Emit real-time notifications
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    forum.admins.forEach((adminId) => {
      const sockets = onlineUsers.get(adminId) || new Set();
      sockets.forEach((socketId) => {
        io.to(socketId).emit(
          "receiveNotification",
          notifications.find((n) => n.user.toString() === adminId.toString())
        );
      });
    });

    res.status(200).json({ message: "Joined forum successfully", forum });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Leave a Forum (With Notification)
export const leaveForum = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.forumId);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    if (!forum.members.includes(req.user._id)) {
      return res.status(400).json({ message: "You are not a member" });
    }

    const isOwner = forum.owner.toString() === req.user._id.toString();
    let message = "Left forum successfully";

    if (isOwner) {
      if (forum.admins.length > 1) {
        // Transfer ownership to the next admin
        const newOwner = forum.admins.find(
          (id) => id.toString() !== req.user._id.toString()
        );
        forum.owner = newOwner;
        forum.admins = forum.admins.filter(
          (id) => id.toString() !== req.user._id.toString()
        );
      } else if (forum.members.length > 1) {
        // Transfer ownership to any member
        const newOwner = forum.members.find(
          (id) => id.toString() !== req.user._id.toString()
        );
        forum.owner = newOwner;
        forum.admins = [newOwner]; // Make the new owner an admin
      } else {
        // No members left, delete the forum
        await Forum.findByIdAndDelete(forum._id);
        return res.json({ message: "Forum deleted as no members were left." });
      }
    }

    // Remove user from members/admins list
    forum.members = forum.members.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    forum.admins = forum.admins.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await forum.save();

    // 🔹 Notify admins
    const notifications = forum.admins.map((adminId) => ({
      user: adminId,
      sender: req.user._id,
      type: "forum_leave",
      message: `${req.user.username} left the forum "${forum.name}".`,
      referenceId: forum._id,
    }));

    await Notification.insertMany(notifications);

    // Emit real-time notifications
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    forum.admins.forEach((adminId) => {
      const sockets = onlineUsers.get(adminId) || new Set();
      sockets.forEach((socketId) => {
        io.to(socketId).emit(
          "receiveNotification",
          notifications.find((n) => n.user.toString() === adminId.toString())
        );
      });
    });

    res.json({ message });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete Forum (With Notification)
export const deleteForum = async (req, res) => {
  try {
    const { forumId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(forumId)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }

    const forum = await Forum.findById(forumId);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    if (forum.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the forum owner can delete the forum" });
    }

    await Forum.findByIdAndDelete(forumId);

    // 🔹 Notify all members
    const notifications = forum.members.map((memberId) => ({
      user: memberId,
      sender: req.user._id,
      type: "forum_delete",
      message: `The forum "${forum.name}" has been deleted.`,
      referenceId: forum._id,
    }));

    await Notification.insertMany(notifications);

    // Emit real-time notifications
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    forum.members.forEach((memberId) => {
      const sockets = onlineUsers.get(memberId) || new Set();
      sockets.forEach((socketId) => {
        io.to(socketId).emit(
          "receiveNotification",
          notifications.find((n) => n.user.toString() === memberId.toString())
        );
      });
    });

    res.status(200).json({ message: "Forum deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
