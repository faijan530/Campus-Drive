import mongoose from "mongoose";

export const ProctoringEventType = Object.freeze({
  TAB_SWITCH: "TAB_SWITCH",
  INACTIVITY: "INACTIVITY",
  VIOLATION: "VIOLATION",
});

const proctoringSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true, index: true },
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "TestAttempt", required: true, index: true },
    type: { type: String, enum: Object.values(ProctoringEventType), required: true },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

proctoringSchema.index({ attemptId: 1, createdAt: -1 });

export const ProctoringEvent = mongoose.model("ProctoringEvent", proctoringSchema);

