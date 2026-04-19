import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  referenceType: { type: String, enum: ["Partner", "Doubt", "General"] },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

export const Conversation = mongoose.model("Conversation", conversationSchema);
