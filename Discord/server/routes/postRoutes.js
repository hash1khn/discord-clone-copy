import express from "express";
import { protect } from "../middleware/auth.js";
import upload, { uploadToSupabase } from "../middleware/uploadMiddleware.js";
import {
  createPost,
  getPosts,
  getPostById,
  editPost,
  deletePost,
  commentOnPost,
  likePost,
} from "../controllers/postController.js";

const router = express.Router();

// ✅ Create Post (Supports File Upload)
router.post("/create-post", protect, upload.single("file"), async (req, res) => {
    try {
      let imageUrl = "";
      
      if (req.file) {
        imageUrl = await uploadToSupabase(req.file);
      }
  
      req.body.imageUrl = imageUrl;
  
      return await createPost(req, res);
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ message: "Image upload failed", error: error.message });
    }
  });
  
  

// ✅ Get All Posts (With Pagination)
router.get("/get-all-post/:forumId", protect, getPosts);

// ✅ Get Single Post
router.get("/get-post/:postId", protect, getPostById);

// ✅ Edit Post (Supports Image Update)
router.put("/edit-post/:postId", protect, upload.single("file"), async (req, res) => {
  try {
    if (req.file) {
      const imageUrl = await uploadToSupabase(req.file);
      req.body.imageUrl = imageUrl;
    }
    
    return await editPost(req, res);
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ message: "Image upload failed", error: error.message });
  }
});


// ✅ Delete Post
router.delete("/delete-post/:postId", protect, deletePost);

// ✅ Comment on Post
router.post("/comment/:postId", protect, commentOnPost);

// ✅ Like/Unlike Post
router.post("/like/:postId", protect, likePost);

export default router;
