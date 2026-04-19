import mongoose from "mongoose";

export const AnswerOptions = Object.freeze({
  A: "A",
  B: "B",
  C: "C",
  D: "D",
});

const questionSchema = new mongoose.Schema(
  {
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true, index: true },
    question: { type: String, required: true, trim: true },
    optionA: { type: String, required: true, trim: true },
    optionB: { type: String, required: true, trim: true },
    optionC: { type: String, required: true, trim: true },
    optionD: { type: String, required: true, trim: true },
    correctAnswer: { type: String, enum: Object.values(AnswerOptions), required: true, select: false },
  },
  { timestamps: true }
);

questionSchema.index({ testId: 1, createdAt: 1 });

export const Question = mongoose.model("Question", questionSchema);

