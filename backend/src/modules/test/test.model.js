import mongoose from "mongoose";

export const TestStatus = Object.freeze({
  SCHEDULED: "SCHEDULED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
});

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 1, max: 600 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: Object.values(TestStatus), required: true, default: TestStatus.SCHEDULED },
  },
  { timestamps: true }
);

testSchema.index({ status: 1, startTime: 1, endTime: 1 });

export const Test = mongoose.model("Test", testSchema);

