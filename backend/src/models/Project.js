import mongoose from "mongoose";

const STATUSES = ["In Progress", "Completed", "On Hold"];

const projectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 800 },
    techStack: [{ type: String, trim: true }],
    githubLink: { type: String, trim: true },
    liveLink: { type: String, trim: true },
    status: { type: String, enum: STATUSES, default: "In Progress" },
    verificationStatus: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" }
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
export { STATUSES as ProjectStatuses };
