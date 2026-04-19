import { questionService } from "../question/question.service.js";
import { badRequest } from "../../utils/httpError.js";

/**
 * Server-side evaluation only.
 * Input answers: [{ questionId, selectedOption }]
 * Output: numeric score
 */
export const evaluationService = {
  async evaluate({ testId, answers }) {
    if (!Array.isArray(answers)) throw badRequest("answers array required");

    const questions = await questionService.getQuestionsForEvaluation(testId);
    const correctById = new Map(questions.map((q) => [q._id.toString(), q.correctAnswer]));

    let score = 0;
    for (const a of answers) {
      const qid = a?.questionId?.toString?.() ?? a?.questionId;
      const selected = a?.selectedOption;
      if (!qid || !selected) continue;
      const correct = correctById.get(String(qid));
      if (correct && String(selected).toUpperCase() === String(correct).toUpperCase()) score += 1;
    }

    return { score, totalQuestions: questions.length };
  },
};

