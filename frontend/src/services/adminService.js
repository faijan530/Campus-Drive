import { api } from "./api.js";

export const getDashboardStats = (token) => {
  return api.get("/api/admin/dashboard", token);
};

export const getStudentsList = (token) => {
  return api.get("/api/admin/students", token);
};

export const getStudentSummary = (token, id) => {
  return api.get(`/api/admin/students/${id}/summary`, token);
};

export const getTestPerformance = (token) => {
  return api.get("/api/admin/test-performance", token);
};

export const getSkillsInsights = (token) => {
  return api.get("/api/admin/skills-insights", token);
};

export const getAllUsers = (token) => {
  return api.get("/api/admin/users", token);
};

export const createTeacher = (token, payload) => {
  return api.post("/api/admin/create-teacher", payload, token);
};
