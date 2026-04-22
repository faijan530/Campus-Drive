import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true, index: true },
    score: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, default: 30 },
    answeredCount: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    submittedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

resultSchema.index({ studentId: 1, testId: 1 }, { unique: true });

export const Result = mongoose.model("Result", resultSchema);

