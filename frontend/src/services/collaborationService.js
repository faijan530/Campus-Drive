import { api } from "./api.js";

export const getPartners = (token) => api.get("/api/collab/partners", token);
export const getPartnerById = (id, token) => api.get(`/api/collab/partners/${id}`, token);
export const createPartnerRequest = (data, token) => api.post("/api/collab/partners", data, token);
export const getMyRequests = (token) => api.get("/api/collab/partners/my-requests", token);
export const applyForPartner = (id, data, token) => api.post(`/api/collab/partners/${id}/apply`, data, token);
export const acceptApplication = (appId, token) => api.post(`/api/collab/partners/apply/${appId}/accept`, {}, token);

export const getDoubts = (token) => api.get("/api/collab/doubts", token);
export const getDoubtById = (id, token) => api.get(`/api/collab/doubts/${id}`, token);
export const createDoubt = (data, token) => api.post("/api/collab/doubts", data, token);
export const resolveDoubt = (id, token) => api.post(`/api/collab/doubts/${id}/resolve`, {}, token);

export const getMyConversations = (token) => api.get("/api/collab/conversations", token);
export const getUnreadCount = (token) => api.get("/api/collab/conversations/unread-count", token);
export const getMessages = (convId, token) => api.get(`/api/collab/conversations/${convId}/messages`, token);
export const postMessage = (convId, data, token) => api.post(`/api/collab/conversations/${convId}/messages`, data, token);
export const askAiAssistant = (data, token) => api.post("/api/collab/ai-assistant", data, token);
