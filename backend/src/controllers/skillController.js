import { Skill, SkillLevels, SkillSources } from "../models/Skill.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, notFound } from "../utils/httpError.js";

export const getSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find({ userId: req.auth.userId }).sort({ createdAt: -1 }).lean();
  res.json({ skills });
});

export const addSkill = asyncHandler(async (req, res) => {
  const { name, level, source } = req.body;

  if (!name?.trim()) throw badRequest("Skill name is required");
  if (!SkillLevels.includes(level)) throw badRequest(`Level must be one of: ${SkillLevels.join(", ")}`);
  if (!SkillSources.includes(source)) throw badRequest(`Source must be one of: ${SkillSources.join(", ")}`);

  try {
    const skill = await Skill.create({ userId: req.auth.userId, name: name.trim(), level, source });
    res.status(201).json({ skill });
  } catch (err) {
    if (err.code === 11000) throw badRequest("Skill already exists");
    throw err;
  }
});

export const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findOneAndDelete({ _id: req.params.id, userId: req.auth.userId });
  if (!skill) throw notFound("Skill not found");
  res.json({ message: "Skill deleted" });
});
