import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const authRoutes = Router();

authRoutes.post("/register", asyncHandler(authController.register));
authRoutes.post("/login", asyncHandler(authController.login));
authRoutes.get("/me", requireAuth, asyncHandler(authController.me));
authRoutes.post("/change-password", requireAuth, asyncHandler(authController.changePassword));

