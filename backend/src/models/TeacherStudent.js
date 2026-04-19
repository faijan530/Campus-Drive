import mongoose from "mongoose";

const tsSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

// Prevent duplicate assignments
tsSchema.index({ teacherId: 1, studentId: 1 }, { unique: true });

export const TeacherStudent = mongoose.model("TeacherStudent", tsSchema);
