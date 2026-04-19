import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getProfile, upsertProfile, getCareerRecommendation } from "../controllers/profileController.js";
import { getSkills, addSkill, deleteSkill } from "../controllers/skillController.js";
import { getProjects, addProject, deleteProject } from "../controllers/projectController.js";
import { uploadResume, getResumeMeta, downloadResume } from "../controllers/resumeController.js";
import { resumeUpload } from "../config/multer.js";

export const profileRoutes = Router();

// All profile routes require authentication
profileRoutes.use(requireAuth);

// ── Profile ─────────────────────────────────────────────
profileRoutes.get("/profile", getProfile);
profileRoutes.post("/profile", upsertProfile);

// ── Career ──────────────────────────────────────────────
profileRoutes.get("/career/recommendation", getCareerRecommendation);

// ── Skills ──────────────────────────────────────────────
profileRoutes.get("/skills", getSkills);
profileRoutes.post("/skills", addSkill);
profileRoutes.delete("/skills/:id", deleteSkill);

// ── Projects ────────────────────────────────────────────
profileRoutes.get("/projects", getProjects);
profileRoutes.post("/projects", addProject);
profileRoutes.delete("/projects/:id", deleteProject);

// ── Resume ──────────────────────────────────────────────
profileRoutes.get("/resume", getResumeMeta);
profileRoutes.get("/resume/download", downloadResume);
profileRoutes.post("/resume", resumeUpload.single("resume"), uploadResume);
