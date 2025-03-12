import { Server } from "socket.io";

export const socketSetup = (server) => {
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "*" },
  });

  const onlineUsers = new Map(); // Stores online users (userId -> socketId Set)

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Handle user connection
    socket.on("userConnected", (userId) => {
      const wasUserOnline = onlineUsers.has(userId);

      if (!wasUserOnline) {
        onlineUsers.set(userId, new Set());
      }

      onlineUsers.get(userId).add(socket.id);

      // Emit update only if user wasn't online before
      if (!wasUserOnline) {
        io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
      }
    });

    // Handle real-time notifications
    socket.on("sendNotification", ({ receiverId, notification }) => {
      const receiverSockets = onlineUsers.get(receiverId);
      if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit("receiveNotification", notification);
        });
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      let userToRemove = null;

      for (let [userId, socketIds] of onlineUsers.entries()) {
        if (socketIds.has(socket.id)) {
          socketIds.delete(socket.id);
          if (socketIds.size === 0) {
            userToRemove = userId; // Mark user for removal
          }
          break;
        }
      }

      // Only update the online users list if a user fully disconnects
      if (userToRemove) {
        onlineUsers.delete(userToRemove);
        io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
      }
    });
  });

  return { io, onlineUsers }; // Return io & onlineUsers to use in controllers
};
