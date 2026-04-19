import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { Roles } from "../utils/roles.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest } from "../utils/httpError.js";
import { proctoringService } from "../modules/proctoring/proctoring.service.js";

export const proctoringRoutes = Router();
proctoringRoutes.use(requireAuth);

const eventSchema = z.object({
  testId: z.string().min(1),
  type: z.enum(["TAB_SWITCH", "INACTIVITY"]),
  meta: z.record(z.any()).optional(),
  // Optional: current answers snapshot for safe auto-submit
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOption: z.enum(["A", "B", "C", "D"]),
      })
    )
    .optional(),
});

proctoringRoutes.post(
  "/event",
  requireRole(Roles.STUDENT),
  asyncHandler(async (req, res) => {
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest("Validation error", parsed.error.flatten());

    const out = await proctoringService.recordEvent({
      studentId: req.auth.userId,
      testId: parsed.data.testId,
      type: parsed.data.type,
      meta: parsed.data.meta,
      answers: parsed.data.answers,
    });
    res.status(201).json(out);
  })
);

