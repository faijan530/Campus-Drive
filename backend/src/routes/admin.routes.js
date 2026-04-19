import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { 
  getDashboardStats, 
  getStudentsList, 
  getStudentSummary, 
  getTestPerformance, 
  getSkillsInsights,
  getAllUsers,
  createTeacher
} from "../controllers/adminController.js";

export const adminRoutes = Router();

// Apply auth and admin-only role to all admin routes
adminRoutes.use(requireAuth);
adminRoutes.use(requireRole("Admin"));

adminRoutes.get("/dashboard", getDashboardStats);
adminRoutes.get("/students", getStudentsList);
adminRoutes.get("/students/:id/summary", getStudentSummary);
adminRoutes.get("/test-performance", getTestPerformance);
adminRoutes.get("/skills-insights", getSkillsInsights);

// User Management
adminRoutes.get("/users", getAllUsers);
adminRoutes.post("/create-teacher", createTeacher);
