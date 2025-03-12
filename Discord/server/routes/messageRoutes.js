import express from "express";
import { protect } from "../middleware/auth.js";
import upload, { uploadToSupabase } from "../middleware/uploadMiddleware.js";
import { sendMessage, getMessages } from "../controllers/messageController.js";

const router = express.Router();

// ✅ Modify sendMessage route to support file upload
router.post("/send", protect, upload.single("file"), async (req, res) => {
  try {
    let fileUrl = "";
    
    if (req.file) {
      fileUrl = await uploadToSupabase(req.file);
    }

    req.body.fileUrl = fileUrl; // Attach file URL to request

    return await sendMessage(req, res); // Pass updated req to controller
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ message: "File upload failed", error: error.message });
  }
});

// ✅ Get messages
router.get("/:userId", protect, getMessages);

export default router;
