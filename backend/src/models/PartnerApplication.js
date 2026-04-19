import mongoose from "mongoose";

const appSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "PartnerRequest", required: true, index: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" }
}, { timestamps: true });

export const PartnerApplication = mongoose.model("PartnerApplication", appSchema);
