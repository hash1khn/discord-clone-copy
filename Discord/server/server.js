import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import notificationRooutes from "./routes/notificationRoutes.js";

import { socketSetup } from "./config/socket.js";

import morgan from "morgan";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup WebSocket (socket.io)
const { io, onlineUsers } = socketSetup(server); // ✅ WebSockets initialized

app.use(morgan("dev"));

// Make io and onlineUsers available in routes
app.set("io", io);
app.set("onlineUsers", onlineUsers);

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/forums", forumRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRooutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`🚀 Server running on port ${PORT}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
});
