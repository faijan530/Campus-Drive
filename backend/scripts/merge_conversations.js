import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Conversation } from "../src/models/Conversation.js";
import { Message } from "../src/models/Message.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env");
  process.exit(1);
}

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const convs = await Conversation.find({});
    const pairMap = new Map();

    for (const c of convs) {
      if (!c.participants || c.participants.length < 2) continue;

      // Sort participant IDs to create a unique key for the pair
      const key = c.participants
        .map((p) => p.toString())
        .sort()
        .join("_");

      if (!pairMap.has(key)) {
        pairMap.set(key, [c]);
      } else {
        pairMap.get(key).push(c);
      }
    }

    let mergedCount = 0;
    for (const [key, list] of pairMap.entries()) {
      if (list.length > 1) {
        console.log(`Found ${list.length} duplicates for pair: ${key}`);
        
        // Sort by lastMessageAt or createdAt to keep the most relevant/oldest one
        list.sort((a, b) => (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt));
        
        const primary = list[0];
        const duplicates = list.slice(1);

        for (const dup of duplicates) {
          console.log(`Merging ${dup._id} into ${primary._id}`);
          
          // Move messages from duplicate conversation to primary
          await Message.updateMany(
            { conversationId: dup._id },
            { conversationId: primary._id }
          );

          // Delete the duplicate conversation
          await Conversation.deleteOne({ _id: dup._id });
          mergedCount++;
        }
      }
    }

    console.log(`Migration finished. Merged ${mergedCount} conversations.`);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
