import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { Roles } from "../utils/roles.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { submissionService } from "../modules/result/submission.service.js";

export const resultRoutes = Router();
resultRoutes.use(requireAuth);

// Student: fetch own latest result (optionally by testId via query)
resultRoutes.get(
  "/me",
  requireRole(Roles.STUDENT),
  asyncHandler(async (req, res) => {
    const testId = req.query.testId?.toString() || "";
    const result = await submissionService.getResultForStudent({ studentId: req.auth.userId, testId: testId || undefined });
    res.json({ result });
  })
);

// Admin: fetch any student's result (latest)
resultRoutes.get(
  "/:studentId",
  requireRole(Roles.ADMIN),
  asyncHandler(async (req, res) => {
    const testId = req.query.testId?.toString() || "";
    const result = await submissionService.getResultForStudent({ studentId: req.params.studentId, testId: testId || undefined });
    res.json({ result });
  })
);

