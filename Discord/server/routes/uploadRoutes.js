import express from "express";
import upload, { uploadToSupabase } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/file", protect, upload.single("file"), async (req, res) => {
  try {
    const fileUrl = await uploadToSupabase(req.file);
    res.json({ fileUrl });
  } catch (error) {
    res.status(500).json({ message: "File upload failed", error: error.message });
  }
});

export default router;
