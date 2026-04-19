import mongoose from "mongoose";

const academicSchema = new mongoose.Schema(
  {
    degree: { type: String, trim: true },
    branch: { type: String, trim: true },
    college: { type: String, trim: true },
    graduationYear: { type: Number },
    cgpa: { type: Number, min: 0, max: 10 },
    backlogs: { type: Number, default: 0 },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    headline: { type: String, trim: true, maxlength: 160 },
    bio: { type: String, trim: true, maxlength: 600 },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    className: { type: String, trim: true },
    section: { type: String, trim: true },
    enrollmentNumber: { type: String, trim: true, unique: true, sparse: true },
    academic: { type: academicSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const Profile = mongoose.model("Profile", profileSchema);
