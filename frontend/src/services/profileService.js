import { api } from "./api.js";

// ── Profile ──────────────────────────────────────────────────────────
export function fetchFullProfile(token) {
  return api.get("/api/profile", token);
}

export function saveProfile(data, token) {
  return api.post("/api/profile", data, token);
}

// ── Skills ───────────────────────────────────────────────────────────
export function fetchSkills(token) {
  return api.get("/api/skills", token);
}

export function addSkill(data, token) {
  return api.post("/api/skills", data, token);
}

export function deleteSkill(id, token) {
  return api.delete(`/api/skills/${id}`, token);
}

// ── Projects ─────────────────────────────────────────────────────────
export function fetchProjects(token) {
  return api.get("/api/projects", token);
}

export function addProject(data, token) {
  return api.post("/api/projects", data, token);
}

export function deleteProject(id, token) {
  return api.delete(`/api/projects/${id}`, token);
}

// ── Resume ───────────────────────────────────────────────────────────
export function fetchResumeMeta(token) {
  return api.get("/api/resume", token);
}

export function uploadResume(file, token) {
  const form = new FormData();
  form.append("resume", file);
  return api.post("/api/resume", form, token);
}

export function downloadResumeUrl() {
  return "/api/resume/download";
}
