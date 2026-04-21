import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { Message } from "./models/Message.js";
import { User } from "./models/User.js";
import { Conversation } from "./models/Conversation.js";

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
       const { senderId, receiverId, content, conversationId, tempId } = data;
       
       let status = "SENT";
       if (onlineUsers.has(receiverId)) {
          status = "DELIVERED";
       }

       const message = await Message.create({
         conversationId,
         senderId,
         content,
         status
       });

       try {
         const conv = await Conversation.findById(conversationId);
         if (conv) {
           conv.lastMessage = content;
           conv.lastMessageAt = new Date();
           const key = receiverId ? receiverId.toString() : null;
           if (key) {
             conv.unreadCount.set(key, (conv.unreadCount.get(key) || 0) + 1);
           }
           await conv.save();
         }
       } catch (err) {
         console.error("Failed to update conversation socket:", err);
       }

       const populatedMsg = await message.populate("senderId", "name role");
       const msgObj = populatedMsg.toObject();
       if (tempId) msgObj.tempId = tempId;

       const receiverSocket = onlineUsers.get(receiverId);
       if (receiverSocket) {
          io.to(receiverSocket).emit("receive-message", msgObj);
       }
       socket.emit("message-status-update", msgObj);
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

    // 📞 WebRTC Signaling ──────────────────────────────────────
    
    // 📞 Call user
    socket.on("call-user", ({ to, offer, callType, fromInfo }) => {
      const receiverSocket = onlineUsers.get(to);
      if (receiverSocket) {
        io.to(receiverSocket).emit("incoming-call", {
          from: fromInfo.id,
          fromName: fromInfo.name,
          offer,
          callType // "audio" or "video"
        });
      }
    });

    // ✅ Accept call
    socket.on("answer-call", ({ to, answer }) => {
      const receiverSocket = onlineUsers.get(to);
      if (receiverSocket) {
        io.to(receiverSocket).emit("call-accepted", { answer });
      }
    });

    // ❌ Reject call
    socket.on("reject-call", ({ to }) => {
      const receiverSocket = onlineUsers.get(to);
      if (receiverSocket) {
        io.to(receiverSocket).emit("call-rejected");
      }
    });

    // 🔁 ICE candidates
    socket.on("ice-candidate", ({ to, candidate }) => {
      const receiverSocket = onlineUsers.get(to);
      if (receiverSocket) {
        io.to(receiverSocket).emit("ice-candidate", { candidate });
      }
    });

    // 📴 End call
    socket.on("end-call", ({ to }) => {
      const receiverSocket = onlineUsers.get(to);
      if (receiverSocket) {
        io.to(receiverSocket).emit("call-ended");
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

