import mongoose from "mongoose";

export const AttemptStatus = Object.freeze({
  STARTED: "STARTED",
  SUBMITTED: "SUBMITTED",
  AUTO_SUBMITTED: "AUTO_SUBMITTED",
});

const attemptSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true, index: true },
    startedAt: { type: Date, required: true },
    endsAt: { type: Date, required: true }, // startedAt + duration
    endedAt: { type: Date, default: null },
    status: { type: String, enum: Object.values(AttemptStatus), required: true, default: AttemptStatus.STARTED },

    // Basic proctoring counters
    violations: { type: Number, required: true, default: 0 },
    tabSwitchCount: { type: Number, required: true, default: 0 },
    inactivityCount: { type: Number, required: true, default: 0 },
    lastActivityAt: { type: Date, default: null },
  },
  { timestamps: true }
);

attemptSchema.index({ studentId: 1, testId: 1 }, { unique: true }); // One attempt per student per test
attemptSchema.index({ testId: 1, status: 1 });

export const TestAttempt = mongoose.model("TestAttempt", attemptSchema);

