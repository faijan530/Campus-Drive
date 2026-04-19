import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { Message } from "./models/Message.js";
import { User } from "./models/User.js";

export const onlineUsers = new Map(); // userId -> socket.id

async function main() {
  await connectDb();
  const app = createApp();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    socket.on("user-online", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    socket.on("typing", ({ senderId, receiverId }) => {
       const receiverSocket = onlineUsers.get(receiverId);
       if (receiverSocket) {
         io.to(receiverSocket).emit("typing", senderId);
       }
    });

    socket.on("stop-typing", ({ senderId, receiverId }) => {
       const receiverSocket = onlineUsers.get(receiverId);
       if (receiverSocket) {
         io.to(receiverSocket).emit("stop-typing", senderId);
       }
    });

    socket.on("send-message", async (data) => {
       // data: { senderId, receiverId, content, conversationId }
       const { senderId, receiverId, content, conversationId } = data;
       
       let status = "SENT";
       if (onlineUsers.has(receiverId)) {
          status = "DELIVERED";
       }

       // We assume the caller sends valid IDs
       const message = await Message.create({
         conversationId,
         senderId,
         content,
         status
       });

       const populatedMsg = await message.populate("senderId", "name role");

       const receiverSocket = onlineUsers.get(receiverId);
       if (receiverSocket) {
          io.to(receiverSocket).emit("receive-message", populatedMsg);
       }
       socket.emit("message-status-update", populatedMsg);
    });

    socket.on("mark-read", async ({ messageId, readerId }) => {
       if (!mongoose.Types.ObjectId.isValid(messageId)) {
          console.log("[Socket] Invalid messageId blocked:", messageId);
          return;
       }

       const message = await Message.findOneAndUpdate(
         { _id: messageId, status: { $ne: "READ" } },
         { status: "READ" },
         { new: true }
       ).populate("senderId", "name role");

       if (message) {
          const senderSocket = onlineUsers.get(message.senderId._id.toString());
          if (senderSocket) {
             io.to(senderSocket).emit("message-read", message);
          }
       }
    });

    socket.on("disconnect", async () => {
      let disconnectedUserId = null;
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }
      if (disconnectedUserId) {
        const timestamp = new Date();
        await User.findByIdAndUpdate(disconnectedUserId, { lastSeen: timestamp });
        io.emit("online-users", Array.from(onlineUsers.keys()));
        io.emit("user-offline", { userId: disconnectedUserId, lastSeen: timestamp.toISOString() });
      }
    });
  });

  // Make io accessible globally if needed, or via app
  app.set("io", io);

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[backend] failed to start", err);
  process.exit(1);
});

