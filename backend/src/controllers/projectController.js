import { Project, ProjectStatuses } from "../models/Project.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, notFound } from "../utils/httpError.js";

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ userId: req.auth.userId }).sort({ createdAt: -1 }).lean();
  res.json({ projects });
});

export const addProject = asyncHandler(async (req, res) => {
  const { title, description, techStack, githubLink, liveLink, status } = req.body;

  if (!title?.trim()) throw badRequest("Project title is required");
  if (status && !ProjectStatuses.includes(status))
    throw badRequest(`Status must be one of: ${ProjectStatuses.join(", ")}`);

  const tech = Array.isArray(techStack)
    ? techStack.map((t) => t.trim()).filter(Boolean)
    : typeof techStack === "string"
    ? techStack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const project = await Project.create({
    userId: req.auth.userId,
    title: title.trim(),
    description: description?.trim(),
    techStack: tech,
    githubLink: githubLink?.trim(),
    liveLink: liveLink?.trim(),
    status: status || "In Progress",
  });

  res.status(201).json({ project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.auth.userId });
  if (!project) throw notFound("Project not found");
  res.json({ message: "Project deleted" });
});
