import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { Roles } from "../utils/roles.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest } from "../utils/httpError.js";

import { testService } from "../modules/test/test.service.js";
import { questionService } from "../modules/question/question.service.js";
import { attemptService } from "../modules/test/attempt.service.js";
import { submissionService } from "../modules/result/submission.service.js";

export const testRoutes = Router();

testRoutes.use(requireAuth);

const createTestSchema = z.object({
  title: z.string().min(3).max(120),
  durationMinutes: z.number().int().min(1).max(600),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

// Admin: create test
testRoutes.post(
  "/",
  requireRole(Roles.ADMIN),
  asyncHandler(async (req, res) => {
    const parsed = createTestSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest("Validation error", parsed.error.flatten());

    const created = await testService.createTest({
      title: parsed.data.title,
      durationMinutes: parsed.data.durationMinutes,
      startTime: new Date(parsed.data.startTime),
      endTime: new Date(parsed.data.endTime),
    });
    res.status(201).json({ test: created });
  })
);

// Student: activate test (within scheduled window only)
testRoutes.post(
  "/:testId/student-activate",
  requireRole(Roles.STUDENT),
  asyncHandler(async (req, res) => {
    console.log("� Student activation route called for testId:", req.params.testId);
    try {
      const updated = await testService.studentActivateTest(req.params.testId);
      console.log("� studentActivateTest succeeded");
      res.json({ test: updated });
    } catch (err) {
      console.log("� studentActivateTest failed:", err.message);
      res.status(403).json({ error: err.message });
    }
  })
);

// Admin: activate test (one active at a time)
testRoutes.post(
  "/:testId/activate",
  requireRole(Roles.ADMIN),
  asyncHandler(async (req, res) => {
    console.log("� Admin activation route called for testId:", req.params.testId);
    try {
      const updated = await testService.activateTest(req.params.testId);
      console.log("� activateTest succeeded");
      res.json({ test: updated });
    } catch (err) {
      console.log("� activateTest failed:", err.message);
      res.status(403).json({ error: err.message });
    }
  })
);

// Get active test (Student)
testRoutes.get(
  "/active",
  asyncHandler(async (req, res) => {
    const test = await testService.getActiveTest();
    res.json({ test, serverNow: new Date().toISOString() });
  })
);

// Student: start attempt
testRoutes.post(
  "/start",
  requireRole(Roles.STUDENT),
  asyncHandler(async (req, res) => {
    const { attempt, test } = await attemptService.startAttempt(req.auth.userId);
    res.status(201).json({
      test: {
        id: test._id,
        title: test.title,
        durationMinutes: test.durationMinutes,
      },
      attempt: {
        id: attempt._id,
        startedAt: attempt.startedAt,
        endsAt: attempt.endsAt,
        status: attempt.status,
        violations: attempt.violations,
      },
      serverNow: new Date().toISOString(),
    });
  })
);

// Student: fetch questions for a test (no correct answers)
testRoutes.get(
  "/:testId/questions",
  requireRole(Roles.STUDENT, Roles.ADMIN),
  asyncHandler(async (req, res) => {
    const questions = await questionService.getQuestionsByTest(req.params.testId);
    res.json({ questions });
  })
);

const addQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(5).max(600),
        optionA: z.string().min(1).max(300),
        optionB: z.string().min(1).max(300),
        optionC: z.string().min(1).max(300),
        optionD: z.string().min(1).max(300),
        correctAnswer: z.enum(["A", "B", "C", "D"]),
      })
    )
    .min(1)
    .max(200),
});

// Admin: add questions
testRoutes.post(
  "/:testId/questions",
  requireRole(Roles.ADMIN),
  asyncHandler(async (req, res) => {
    const parsed = addQuestionsSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest("Validation error", parsed.error.flatten());
    const created = await questionService.addQuestions(req.params.testId, parsed.data.questions);
    res.status(201).json({ count: created.length });
  })
);

const submitSchema = z.object({
  testId: z.string().min(1),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOption: z.enum(["A", "B", "C", "D"]),
      })
    )
    .default([]),
});

// Student: submit test
testRoutes.post(
  "/submit",
  requireRole(Roles.STUDENT),
  asyncHandler(async (req, res) => {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest("Validation error", parsed.error.flatten());

    const result = await submissionService.submitTest({
      studentId: req.auth.userId,
      testId: parsed.data.testId,
      answers: parsed.data.answers,
      source: "MANUAL",
    });
    res.json({ result });
  })
);

