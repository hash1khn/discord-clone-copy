import multer from "multer";
import supabase from "../config/supabase.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const storage = multer.memoryStorage(); // Store files in memory before uploading
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const uploadToSupabase = async (file) => {
  if (!file) throw new Error("❌ No file provided");

  const fileExt = path.extname(file.originalname);
  const fileName = `${uuidv4()}${fileExt}`;

  console.log(`📂 Uploading file: ${fileName} to bucket: ${process.env.SUPABASE_BUCKET_NAME}`);

  // Verify the bucket name
  if (!process.env.SUPABASE_BUCKET_NAME) {
    throw new Error("❌ Bucket name is not defined in .env");
  }

  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET_NAME)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false, // Prevent overwriting files
    });

  if (error) {
    console.error("❌ Supabase Upload Error:", error.message);
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  console.log("✅ File uploaded successfully:", data);

   // ✅ Fix Public URL Retrieval
   const { publicUrl } = supabase.storage
   .from(process.env.SUPABASE_BUCKET_NAME)
   .getPublicUrl(fileName).data;

 if (!publicUrl) {
   throw new Error("❌ Public URL retrieval failed");
 }

 console.log("🌍 Public URL:", publicUrl);
 return publicUrl;
 
};

export default upload;
