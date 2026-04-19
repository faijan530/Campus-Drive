import { api } from "./api.js";

export const getTeacherDashboard = (token) => {
  return api.get("/api/teacher/dashboard", token);
};

export const getTeacherStudents = (token) => {
  return api.get("/api/teacher/students", token);
};

export const getTeacherStudentSummary = (token, id) => {
  return api.get(`/api/teacher/students/${id}`, token);
};

export const getProjectsForReview = (token) => {
  return api.get("/api/teacher/projects", token);
};

export const verifyProject = (token, projectId, status) => {
  return api.post("/api/teacher/projects/verify", { projectId, status }, token);
};
