import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { Roles } from "../utils/roles.js";

import {
  createPartnerRequest, getPartnerRequests, getPartnerRequestById, applyForPartner, getMyRequests, acceptApplication,
  createDoubt, getDoubts, getDoubtById, resolveDoubt,
  getMessages, postMessage, getMyConversations, getUnreadCount, askAiAssistant
} from "../controllers/collaboration.controller.js";

export const collabRoutes = Router();

collabRoutes.use(requireAuth);

// Partners
collabRoutes.post("/partners", requireRole(Roles.STUDENT), createPartnerRequest);
collabRoutes.get("/partners", getPartnerRequests);
collabRoutes.get("/partners/my-requests", requireRole(Roles.STUDENT), getMyRequests);
collabRoutes.get("/partners/:id", getPartnerRequestById);
collabRoutes.post("/partners/:id/apply", requireRole(Roles.STUDENT), applyForPartner);
collabRoutes.post("/partners/apply/:appId/accept", requireRole(Roles.STUDENT), acceptApplication);

// Doubts
collabRoutes.post("/doubts", requireRole(Roles.STUDENT), createDoubt);
collabRoutes.get("/doubts", getDoubts);
collabRoutes.get("/doubts/:id", getDoubtById);
collabRoutes.post("/doubts/:id/resolve", resolveDoubt);

// Chat/Conversations
collabRoutes.get("/conversations/unread-count", getUnreadCount);
collabRoutes.get("/conversations", getMyConversations);
collabRoutes.get("/conversations/:convId/messages", getMessages);
collabRoutes.post("/conversations/:convId/messages", postMessage);

// AI Assistant
collabRoutes.post("/ai-assistant", askAiAssistant);
