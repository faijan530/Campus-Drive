import { User } from "../models/User.js";
import { Profile } from "../models/Profile.js";
import { Skill } from "../models/Skill.js";
import { Resume } from "../models/Resume.js";
import { Result } from "../modules/result/result.model.js";
import { Test } from "../modules/test/test.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Utility to fetch accurate user score averages
const getRealStudentAverages = async () => {
  const aggs = await Result.aggregate([
    {
      $group: {
        _id: "$studentId",
        avgScore: { $avg: "$score" }
      }
    }
  ]);
  
  const map = {};
  aggs.forEach(a => map[a._id.toString()] = a.avgScore);
  return map;
};

export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalStudents = await User.countDocuments({ role: "Student" });
  
  const globalAvgData = await Result.aggregate([{ $group: { _id: null, avgScore: { $avg: "$score" } } }]);
  const globalAvg = globalAvgData.length > 0 ? Math.round(globalAvgData[0].avgScore) : 0;
  
  res.json({
    totalStudents,
    avgScore: globalAvg
  });
});

export const getStudentsList = asyncHandler(async (req, res) => {
  const students = await User.find({ role: "Student" }).select("name email").lean();
  const avgMap = await getRealStudentAverages();
  
  const formatted = students.map(s => ({
    id: s._id,
    name: s.name,
    email: s.email,
    avgScore: avgMap[s._id.toString()] ? Math.round(avgMap[s._id.toString()]) : 0
  }));
  
  res.json({ students: formatted });
});

export const getStudentSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const [user, profile, skills, resume] = await Promise.all([
    User.findById(id).lean(),
    Profile.findOne({ userId: id }).lean(),
    Skill.find({ userId: id }).lean(),
    Resume.findOne({ userId: id }).lean(),
  ]);

  if (!user) {
    return res.status(404).json({ message: "Student not found" });
  }
  
  const avgData = await Result.aggregate([{ $match: { studentId: new mongoose.Types.ObjectId(id) } }, { $group: { _id: null, avgScore: { $avg: "$score" } } }]);
  const avgScore = avgData.length > 0 ? Math.round(avgData[0].avgScore) : 0;

  res.json({
    summary: {
      name: user.name,
      academics: profile?.academic || {},
      avgScore: avgScore,
      skills: skills.map(s => ({ name: s.name, level: s.level })),
      resumeUrl: resume ? `/api/resume/download?userId=${id}` : null
    }
  });
});

export const getTestPerformance = asyncHandler(async (req, res) => {
  // Aggregate real test data directly from the Result model matching tests
  const testAgg = await Result.aggregate([
    {
      $group: {
        _id: "$testId",
        avgScore: { $avg: "$score" },
        attempts: { $sum: 1 }
      }
    }
  ]);
  
  // To get test names and proper completion rates, we need the total students who could have taken it
  const totalStudents = await User.countDocuments({ role: "Student" });
  
  // Assuming testId points to a test model
  const tests = await Test.find({ _id: { $in: testAgg.map(t => t._id) } }).select("title _id").lean();
  const testMap = {};
  tests.forEach(t => testMap[t._id.toString()] = t.title);
  
  const report = testAgg.map(t => ({
    testId: t._id,
    testName: testMap[t._id.toString()] || "Untitled Test",
    avgScore: Math.round(t.avgScore),
    completionRate: totalStudents > 0 ? Math.round((t.attempts / totalStudents) * 100) : 0
  }));
  
  res.json({ performance: report });
});

export const getSkillsInsights = asyncHandler(async (req, res) => {
  const allSkills = await Skill.find().lean();
  
  const counts = {};
  allSkills.forEach(s => {
    // Normalize casing for accurate grouping
    const name = s.name.trim();
    if (!counts[name]) counts[name] = 0;
    counts[name]++;
  });
  
  const sorted = Object.entries(counts).map(([name, count]) => ({ name, count }));
  // Top 5 descending count
  const topSkills = [...sorted].sort((a, b) => b.count - a.count).slice(0, 5);
  
  const topSkillNames = new Set(topSkills.map(s => s.name));
  
  // Weak skills logic: count < 3 AND not already classified as a Top Skill
  const weakSkillsRaw = sorted.filter(s => s.count < 3 && !topSkillNames.has(s.name));
  
  // Sort weak skills ascending (weakest first)
  weakSkillsRaw.sort((a, b) => a.count - b.count);
  const weakSkills = weakSkillsRaw.slice(0, 10);
  
  res.json({
    topSkills,
    weakSkills
  });
});

// --- USER MANAGEMENT ---

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select("name email role createdAt isActive")
    .sort({ createdAt: -1 })
    .lean();
    
  const userIds = users.map(u => u._id);
  const profiles = await Profile.find({ userId: { $in: userIds } }).lean();
  const profileMap = {};
  profiles.forEach(p => profileMap[p.userId.toString()] = p);

  const formatted = users.map(u => {
    const prof = profileMap[u._id.toString()];
    return {
      ...u,
      className: prof?.className || "N/A",
      section: prof?.section || "N/A",
      enrollmentNumber: prof?.enrollmentNumber || "N/A"
    };
  });
    
  res.json({ users: formatted });
});

export const createTeacher = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }
  
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    return res.status(400).json({ message: "Email is already in use" });
  }
  
  const passwordHash = await User.hashPassword(password);
  
  const teacher = await User.create({
    name,
    email,
    passwordHash,
    role: "Teacher", // Strictly hardcoded to Teacher
    isActive: true
  });
  
  res.status(201).json({ 
    message: "Teacher account created successfully",
    user: { id: teacher._id, name: teacher.name, email: teacher.email, role: teacher.role }
  });
});
