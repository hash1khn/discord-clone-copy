import Post from "../models/Post.js";
import Forum from "../models/Forum.js";
import { uploadToSupabase } from "../middleware/uploadMiddleware.js";
import Notification from "../models/Notification.js";

// ✅ Create Post (With Notification)
export const createPost = async (req, res) => {
  try {
    const { forumId, content } = req.body;
    if (!forumId || (!content && !req.file)) {
      return res.status(400).json({ message: "Content or image is required" });
    }

    const forum = await Forum.findById(forumId);
    if (!forum) return res.status(404).json({ message: "Forum not found" });

    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadToSupabase(req.file);
    }

    const post = await Post.create({
      forum: forumId,
      user: req.user._id,
      content: content?.trim() || "",
      imageUrl,
    });

    // 🔹 Notify forum members
    const forumMembers = forum.members.filter(
      (member) => member.toString() !== req.user._id.toString()
    );

    const notifications = forumMembers.map((member) => ({
      user: member,
      sender: req.user._id,
      type: "forum_post",
      message: `${req.user.username} created a new post in "${forum.name}".`,
      referenceId: post._id,
    }));

    await Notification.insertMany(notifications);

    // 🔹 Emit real-time notifications
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    forumMembers.forEach((member) => {
      const sockets = onlineUsers.get(member) || new Set();
      sockets.forEach((socketId) => {
        io.to(socketId).emit(
          "receiveNotification",
          notifications.find((n) => n.user.toString() === member.toString())
        );
      });
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Posts (With Pagination & Sorting)
export const getPosts = async (req, res) => {
  try {
    const { forumId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ forum: forumId })
      .populate("user", "username handle")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
};

// ✅ Get Single Post
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("user", "username handle")
      .populate("comments.user", "username"); // Fetch username dynamically

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Edit Post (Only Post Owner)
export const editPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Handle image upload if a new file is provided
    if (req.file) {
      const imageUrl = await uploadToSupabase(req.file);
      post.imageUrl = imageUrl;
    }

    // Update content if provided
    post.content = content?.trim() || post.content;

    await post.save();

    res.json({ message: "Post updated", post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete Post (Owner or Forum Admin)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const forum = await Forum.findById(post.forum);
    const isAdmin = forum.admins.includes(req.user._id);
    if (post.user.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Like/Unlike Post (With Notification)
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const index = post.likes.indexOf(req.user._id);
    let notification = null;

    if (index === -1) {
      post.likes.push(req.user._id);

      // 🔹 Notify post author
      if (post.user.toString() !== req.user._id.toString()) {
        notification = await Notification.create({
          user: post.user,
          sender: req.user._id,
          type: "like",
          message: `${req.user.username} liked your post.`,
          referenceId: post._id,
        });

        // Emit real-time notification
        const io = req.app.get("io");
        const onlineUsers = req.app.get("onlineUsers");
        const authorSockets = onlineUsers.get(post.user) || new Set();
        authorSockets.forEach((socketId) => {
          io.to(socketId).emit("receiveNotification", notification);
        });
      }
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ message: index === -1 ? "Post liked" : "Post unliked", post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Comment on Post (With Notification)
export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ message: "Comment text is required" });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: req.user._id, text });
    await post.save();

    // 🔹 Notify post author
    if (post.user.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        user: post.user,
        sender: req.user._id,
        type: "comment",
        message: `${req.user.username} commented on your post.`,
        referenceId: post._id,
      });

      // Emit real-time notification
      const io = req.app.get("io");
      const onlineUsers = req.app.get("onlineUsers");
      const authorSockets = onlineUsers.get(post.user) || new Set();
      authorSockets.forEach((socketId) => {
        io.to(socketId).emit("receiveNotification", notification);
      });
    }

    res.json({ message: "Comment added", post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
