import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { 
  getDashboardStats, 
  getStudentsList, 
  getStudentSummary, 
  getProjectsForReview, 
  verifyProject 
} from "../controllers/teacherController.js";

export const teacherRoutes = Router();

teacherRoutes.use(requireAuth);
teacherRoutes.use(requireRole("Teacher"));

teacherRoutes.get("/dashboard", getDashboardStats);
teacherRoutes.get("/students", getStudentsList);
teacherRoutes.get("/students/:id", getStudentSummary);
teacherRoutes.get("/projects", getProjectsForReview);
teacherRoutes.post("/projects/verify", verifyProject);
