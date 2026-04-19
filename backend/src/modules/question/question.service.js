import { badRequest, notFound } from "../../utils/httpError.js";
import { Question } from "./question.model.js";
import { testService } from "../test/test.service.js";

export const questionService = {
  async addQuestions(testId, questions) {
    await testService.getTestById(testId);
    if (!Array.isArray(questions) || questions.length === 0) throw badRequest("questions array required");

    const docs = questions.map((q) => ({
      testId,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
    }));

    const created = await Question.insertMany(docs);
    return created.map((d) => d.toObject());
  },

  /**
   * Student-safe question fetch (no correct answers).
   */
  async getQuestionsByTest(testId) {
    await testService.getTestById(testId);
    const qs = await Question.find({ testId })
      .select("question optionA optionB optionC optionD")
      .sort({ createdAt: 1 })
      .lean();

    if (!qs) throw notFound("Questions not found");
    return qs;
  },

  /**
   * Internal fetch for evaluation (includes correct answers).
   */
  async getQuestionsForEvaluation(testId) {
    const qs = await Question.find({ testId })
      .select("+correctAnswer question optionA optionB optionC optionD")
      .lean();
    return qs;
  },
};

