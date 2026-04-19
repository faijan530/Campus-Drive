import { badRequest, forbidden } from "../../utils/httpError.js";
import { ProctoringEvent, ProctoringEventType } from "./proctoring.model.js";
import { attemptService, VIOLATION_THRESHOLD } from "../test/attempt.service.js";
import { submissionService } from "../result/submission.service.js";

export const proctoringService = {
  async recordEvent({ studentId, testId, type, meta, answers }) {
    if (!Object.values(ProctoringEventType).includes(type)) throw badRequest("Invalid event type");

    const attempt = await attemptService.getAttemptOrThrow(studentId, testId);
    if (attempt.status !== "STARTED") throw forbidden("Attempt is not active");

    await ProctoringEvent.create({
      studentId,
      testId,
      attemptId: attempt._id,
      type,
      meta: meta ?? {},
    });

    const updated = await attemptService.incrementViolation(attempt._id, type);

    // Auto submit if violations exceed threshold
    if ((updated?.violations ?? 0) >= VIOLATION_THRESHOLD) {
      const res = await submissionService.submitTest({
        studentId,
        testId,
        answers: Array.isArray(answers) ? answers : [],
        source: "AUTO",
      });
      return { autoSubmitted: true, result: res, violations: updated.violations };
    }

    return { autoSubmitted: false, violations: updated?.violations ?? 0 };
  },
};

