import mongoose from "mongoose";

const reqSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  skillsRequired: [{ type: String }],
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
  duration: { type: String, required: true },
  status: { type: String, enum: ["Open", "Closed"], default: "Open" },
}, { timestamps: true });

export const PartnerRequest = mongoose.model("PartnerRequest", reqSchema);
