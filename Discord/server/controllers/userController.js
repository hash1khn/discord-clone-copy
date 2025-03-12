import User from "../models/User.js";
import { uploadToSupabase } from "../middleware/uploadMiddleware.js"; // For avatar uploads

// 🔹 Get User Profile
export const getUserProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password")
      .populate("friends", "username handle avatar");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// 🔹 Get User Profile (self)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("friends", "username handle avatar");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// 🔹 Update User Profile (Supports Avatar Upload)
export const updateUserProfile = async (req, res) => {
  try {
    const { username } = req.body;
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (username) user.username = username;

    // Handle avatar upload
    if (req.file) {
      const avatarUrl = await uploadToSupabase(req.file);
      user.avatar = avatarUrl;
    }

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// 🔹 Search Users by @handle or name (with Pagination)
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { handle: { $regex: query, $options: "i" } },
      ],
    })
      .select("username handle avatar")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// 🔹 Send Friend Request (Pending System)
export const sendFriendRequest = async (req, res) => {
  try {
    const sender = await User.findById(req.user.id);
    const receiver = await User.findById(req.params.receiverId);

    if (!receiver) return res.status(404).json({ error: "User not found" });
    if (sender.friends.includes(receiver._id))
      return res.status(400).json({ error: "Already friends" });

    // Check if request already sent
    if (receiver.friendRequests.includes(sender._id)) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    receiver.friendRequests.push(sender._id);
    await receiver.save();

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// 🔹 Accept or Reject Friend Request
export const handleFriendRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const sender = await User.findById(req.params.requestId);

    if (!sender) return res.status(404).json({ error: "User not found" });

    const requestIndex = user.friendRequests.indexOf(sender._id);
    if (requestIndex === -1)
      return res
        .status(400)
        .json({ error: "No pending friend request from this user" });

    // Accept Request
    if (req.body.action === "accept") {
      user.friends.push(sender._id);
      sender.friends.push(user._id);
      await sender.save();
      res.status(200).json({ message: "Friend request accepted" });
    } else if (req.body.action === "reject") {
      res.status(200).json({ message: "Friend request rejected" });
    }

    // Remove request after handling
    user.friendRequests.splice(requestIndex, 1);
    await user.save();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// 🔹 Remove Friend
export const removeFriend = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const friend = await User.findById(req.params.friendId);

    if (!friend) return res.status(404).json({ error: "User not found" });

    if (!user.friends.includes(friend._id))
      return res.status(400).json({ error: "You are not friends" });

    user.friends = user.friends.filter(
      (id) => id.toString() !== friend._id.toString()
    );
    friend.friends = friend.friends.filter(
      (id) => id.toString() !== user._id.toString()
    );

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
