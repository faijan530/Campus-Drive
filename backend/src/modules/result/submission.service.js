import { Result } from "./result.model.js";
import { evaluationService } from "./evaluation.service.js";
import { attemptService } from "../test/attempt.service.js";
import { AttemptStatus } from "../test/attempt.model.js";
import { badRequest, forbidden } from "../../utils/httpError.js";

export const submissionService = {
  /**
   * Submits a test for a student. Enforces:
   * - Attempt exists
   * - No double submit
   * - Auto submit on timeout (server decides)
   */
  async submitTest({ studentId, testId, answers, source = "MANUAL" }) {
    const attempt = await attemptService.getAttemptOrThrow(studentId, testId);
    const { expired, now } = attemptService.validateAttemptTiming(attempt);

    const finalStatus = expired || source === "AUTO" ? AttemptStatus.AUTO_SUBMITTED : AttemptStatus.SUBMITTED;

    const exists = await Result.exists({ studentId, testId });
    if (exists) throw forbidden("Result already exists; no resubmission allowed");

    const { score, totalQuestions } = await evaluationService.evaluate({ testId, answers });

    await Result.create({
      studentId,
      testId,
      score,
      submittedAt: now,
    });

    await attemptService.markSubmitted(attempt, { status: finalStatus, endedAt: now });

    return { score, totalQuestions, status: finalStatus, submittedAt: now.toISOString() };
  },

  async getResultForStudent({ studentId, testId }) {
    if (!studentId) throw badRequest("studentId required");
    const q = { studentId };
    if (testId) q.testId = testId;

    const result = await Result.findOne(q).sort({ submittedAt: -1 }).lean();
    if (!result) throw forbidden("Result not found");
    return result;
  },
};

