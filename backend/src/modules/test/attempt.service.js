import { badRequest, forbidden, notFound } from "../../utils/httpError.js";
import { testService } from "./test.service.js";
import { TestAttempt, AttemptStatus } from "./attempt.model.js";

export const VIOLATION_THRESHOLD = 3;

export const attemptService = {
  async startAttempt(studentId) {
    const active = await testService.getActiveTest();
    if (!active) throw forbidden("No active test currently");

    // Allow students to start active tests regardless of scheduled time window
    // The test timer will still respect the original duration
    const now = new Date();
    // if (now < new Date(active.startTime) || now > new Date(active.endTime)) {
    //   throw forbidden("Test is not available in this time window");
    // }

    const existing = await TestAttempt.findOne({ studentId, testId: active._id }).lean();
    if (existing) {
      if (existing.status !== AttemptStatus.STARTED) throw forbidden("No retake allowed");
      return { attempt: existing, test: active };
    }

    const startedAt = now;
    const endsAt = new Date(startedAt.getTime() + active.durationMinutes * 60 * 1000);

    const attempt = await TestAttempt.create({
      studentId,
      testId: active._id,
      startedAt,
      endsAt,
      status: AttemptStatus.STARTED,
      violations: 0,
      tabSwitchCount: 0,
      inactivityCount: 0,
      lastActivityAt: startedAt,
    });

    return { attempt: attempt.toObject(), test: active };
  },

  async getAttemptOrThrow(studentId, testId) {
    const attempt = await TestAttempt.findOne({ studentId, testId });
    if (!attempt) throw notFound("Attempt not found");
    return attempt;
  },

  /**
   * Ensures an attempt is still valid for submission; returns { expired }.
   */
  validateAttemptTiming(attempt) {
    if (attempt.status !== AttemptStatus.STARTED) throw forbidden("Attempt already submitted");
    const now = new Date();
    const expired = now > attempt.endsAt;
    return { expired, now };
  },

  async markSubmitted(attempt, { status, endedAt }) {
    attempt.status = status;
    attempt.endedAt = endedAt;
    await attempt.save();
    return attempt.toObject();
  },

  async incrementViolation(attemptId, type) {
    const update = {
      $inc: { violations: 1 },
      $set: { lastActivityAt: new Date() },
    };
    if (type === "TAB_SWITCH") update.$inc.tabSwitchCount = 1;
    if (type === "INACTIVITY") update.$inc.inactivityCount = 1;

    const updated = await TestAttempt.findByIdAndUpdate(attemptId, update, { new: true }).lean();
    return updated;
  },
};

