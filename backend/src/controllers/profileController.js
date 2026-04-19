import { Profile } from "../models/Profile.js";
import { Skill } from "../models/Skill.js";
import { Project } from "../models/Project.js";
import { Resume } from "../models/Resume.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { careerService } from "../services/careerService.js";

// ── Computation helpers ───────────────────────────────────────────────────────

/**
 * Profile strength (0-100): proportion of key fields filled.
 */
function computeStrength(profile, skills, projects, resume) {
  const checks = [
    profile?.headline,
    profile?.bio,
    profile?.phone,
    profile?.location,
    profile?.linkedIn,
    profile?.github,
    profile?.academic?.degree,
    profile?.academic?.college,
    profile?.academic?.cgpa,
    skills.length > 0,
    projects.length > 0,
    !!resume,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

/**
 * Skill coverage: percentage of skills rated Advanced/Intermediate.
 * Returns 0 if no skills.
 */
function computeSkillCoverage(skills) {
  if (!skills.length) return 0;
  const strong = skills.filter((s) =>
    ["Intermediate", "Advanced"].includes(s.level)
  ).length;
  return Math.round((strong / skills.length) * 100);
}

/**
 * Project depth classification.
 */
function computeProjectDepth(projects) {
  if (projects.length === 0) return "None";
  if (projects.length === 1) return "Low";
  if (projects.length <= 3) return "Medium";
  return "High";
}

/**
 * Academic strength based on CGPA.
 */
function computeAcademicStrength(profile) {
  const cgpa = profile?.academic?.cgpa;
  if (cgpa == null) return "Unknown";
  if (cgpa >= 8.0) return "Strong";
  if (cgpa >= 6.0) return "Moderate";
  return "Needs Improvement";
}

/**
 * Generate actionable recommendations.
 */
function generateRecommendations(profile, skills, projects, resume) {
  const recs = [];
  if (!profile?.headline) recs.push("Add a professional headline to your profile");
  if (!profile?.github) recs.push("Link your GitHub account");
  if (!profile?.linkedIn) recs.push("Add your LinkedIn profile URL");
  if (skills.length === 0) recs.push("Add at least one skill to get started");
  else if (skills.filter((s) => s.level === "Advanced").length === 0)
    recs.push("Advance at least one skill level to Advanced");
  if (projects.length === 0) recs.push("Add at least one project to your portfolio");
  else if (projects.length < 3) recs.push("Add more projects to demonstrate breadth");
  if (!resume) recs.push("Upload your resume (PDF) to complete your profile");
  if (!profile?.academic?.cgpa) recs.push("Add your CGPA in academic details");
  return recs.slice(0, 5); // cap at 5
}

/**
 * Completion guide checklist with boolean done flags.
 */
function buildCompletionGuide(profile, skills, projects, resume) {
  return [
    { task: "Add headline & bio", done: !!(profile?.headline && profile?.bio) },
    { task: "Fill academic details", done: !!(profile?.academic?.degree && profile?.academic?.cgpa) },
    { task: "Add at least 3 skills", done: skills.length >= 3 },
    { task: "Add at least 1 project", done: projects.length >= 1 },
    { task: "Upload resume", done: !!resume },
    { task: "Link GitHub or LinkedIn", done: !!(profile?.github || profile?.linkedIn) },
  ];
}

// ── Controllers ───────────────────────────────────────────────────────────────

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;

  const [profile, skills, projects, resume] = await Promise.all([
    Profile.findOne({ userId }).lean(),
    Skill.find({ userId }).sort({ createdAt: -1 }).lean(),
    Project.find({ userId }).sort({ createdAt: -1 }).lean(),
    Resume.findOne({ userId }).lean(),
  ]);

  const strength        = computeStrength(profile, skills, projects, resume);
  const skillCoverage   = computeSkillCoverage(skills);
  const projectDepth    = computeProjectDepth(projects);
  const academicStrength = computeAcademicStrength(profile);
  const recommendations = generateRecommendations(profile, skills, projects, resume);
  const completionGuide = buildCompletionGuide(profile, skills, projects, resume);

  const careerRecommendations = careerService.calculateCareerMatches({ skills, projects });

  // Hire readiness label
  const hireLabel =
    strength >= 80 ? "Strong" : strength >= 50 ? "Moderate" : "Weak";

  res.json({
    profile: profile || {},
    skills,
    projects,
    resume: resume
      ? {
          filename: resume.originalName,
          uploadedAt: resume.uploadedAt,
          size: resume.size,
        }
      : null,
    strength,
    hireLabel,
    insights: {
      skillCoverage,
      projectDepth,
      academicStrength,
      skillsCount: skills.length,
      projectsCount: projects.length,
    },
    recommendations,
    completionGuide,
    careerRecommendations,
  });
});

export const getCareerRecommendation = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  const [skills, projects] = await Promise.all([
    Skill.find({ userId }).lean(),
    Project.find({ userId }).lean()
  ]);
  
  const recommendations = careerService.calculateCareerMatches({ skills, projects });
  res.json({ recommendations });
});

export const upsertProfile = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  const allowed = [
    "headline", "bio", "phone", "location",
    "linkedIn", "github", "portfolio", "academic",
    "className", "section", "enrollmentNumber"
  ];

  if (req.body.enrollmentNumber !== undefined && !req.body.enrollmentNumber.trim()) {
    return res.status(400).json({ message: "Enrollment number must not be empty" });
  }
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }

  const profile = await Profile.findOneAndUpdate(
    { userId },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ profile });
});
