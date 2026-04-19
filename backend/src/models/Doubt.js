import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ["DSA", "Web Dev", "Resume", "Career"], required: true },
  priority: { type: String, enum: ["Normal", "Urgent"], default: "Normal" },
  status: { type: String, enum: ["Open", "Resolved"], default: "Open" },
}, { timestamps: true });

export const Doubt = mongoose.model("Doubt", doubtSchema);
