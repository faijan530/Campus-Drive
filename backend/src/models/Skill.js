import mongoose from "mongoose";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const SOURCES = ["Project", "Test", "Course", "Self-taught", "Internship"];

const skillSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    level: { type: String, enum: LEVELS, required: true },
    source: { type: String, enum: SOURCES, required: true },
  },
  { timestamps: true }
);

// Prevent duplicate skill names per user (case-insensitive via index)
skillSchema.index({ userId: 1, name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export const Skill = mongoose.model("Skill", skillSchema);
export { LEVELS as SkillLevels, SOURCES as SkillSources };
