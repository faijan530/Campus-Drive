import { TeacherStudent } from "../models/TeacherStudent.js";
import { User } from "../models/User.js";
import { Project } from "../models/Project.js";
import { Profile } from "../models/Profile.js";
import { Skill } from "../models/Skill.js";
import { Result } from "../modules/result/result.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Utility to get average score dynamically for specified students
const getStudentAverages = async (studentIds) => {
  const aggs = await Result.aggregate([
    { $match: { studentId: { $in: studentIds } } },
    { $group: { _id: "$studentId", avgScore: { $avg: "$score" } } }
  ]);
  
  const map = {};
  aggs.forEach(a => map[a._id.toString()] = a.avgScore);
  return map;
};

export const getDashboardStats = asyncHandler(async (req, res) => {
  const teacherId = req.auth.userId;
  let assignments = await TeacherStudent.find({ teacherId }).lean();
  
  if (assignments.length === 0) {
     const allStudents = await User.find({ role: "Student" }).lean();
     if (allStudents.length > 0) {
        await TeacherStudent.insertMany(allStudents.map(s => ({ teacherId, studentId: s._id })));
        assignments = await TeacherStudent.find({ teacherId }).lean();
     }
  }

  const studentIds = assignments.map(a => a.studentId);
  const totalStudents = studentIds.length;
  let globalAvg = 0;
  
  if (totalStudents > 0) {
    const globalAvgData = await Result.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      { $group: { _id: null, avgScore: { $avg: "$score" } } }
    ]);
    globalAvg = globalAvgData.length > 0 ? Math.round(globalAvgData[0].avgScore) : 0;
  }
  
  res.json({
    totalStudents,
    avgScore: globalAvg
  });
});

export const getStudentsList = asyncHandler(async (req, res) => {
  const teacherId = req.auth.userId;
  let assignments = await TeacherStudent.find({ teacherId }).lean();
  
  if (assignments.length === 0) {
     const allStudents = await User.find({ role: "Student" }).lean();
     if (allStudents.length > 0) {
        await TeacherStudent.insertMany(allStudents.map(s => ({ teacherId, studentId: s._id })));
        assignments = await TeacherStudent.find({ teacherId }).lean();
     }
  }

  const studentIds = assignments.map(a => a.studentId);
  const students = await User.find({ _id: { $in: studentIds } }).select("name email").lean();
  const avgMap = await getStudentAverages(studentIds);
  
  const profiles = await Profile.find({ userId: { $in: studentIds } }).lean();
  const profileMap = {};
  profiles.forEach(p => profileMap[p.userId.toString()] = p);
  
  const formatted = students.map(s => {
    const prof = profileMap[s._id.toString()];
    return {
      id: s._id,
      name: s.name,
      email: s.email,
      avgScore: avgMap[s._id.toString()] ? Math.round(avgMap[s._id.toString()]) : 0,
      className: prof?.className || "N/A",
      section: prof?.section || "N/A",
      enrollmentNumber: prof?.enrollmentNumber || "N/A"
    };
  });
  
  res.json({ students: formatted });
});

export const getStudentSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const teacherId = req.auth.userId;
  
  // Guard clause: ensure student is assigned to this teacher
  const isAssigned = await TeacherStudent.exists({ teacherId, studentId: id });
  if (!isAssigned) {
    return res.status(403).json({ message: "Student not assigned to you" });
  }
  
  const [user, profile, skills, projects] = await Promise.all([
    User.findById(id).lean(),
    Profile.findOne({ userId: id }).lean(),
    Skill.find({ userId: id }).lean(),
    Project.find({ userId: id }).lean(),
  ]);

  if (!user) return res.status(404).json({ message: "Student not found" });
  
  const avgData = await Result.aggregate([{ $match: { studentId: new mongoose.Types.ObjectId(id) } }, { $group: { _id: null, avgScore: { $avg: "$score" } } }]);
  const avgScore = avgData.length > 0 ? Math.round(avgData[0].avgScore) : 0;

  res.json({
    summary: {
      name: user.name,
      academics: profile?.academic || {},
      avgScore: avgScore,
      skills: skills.map(s => ({ name: s.name, level: s.level })),
      projects: projects.map(p => ({ 
        id: p._id, title: p.title, status: p.status, verificationStatus: p.verificationStatus 
      }))
    }
  });
});

export const getProjectsForReview = asyncHandler(async (req, res) => {
  const teacherId = req.auth.userId;
  let assignments = await TeacherStudent.find({ teacherId }).lean();
  
  if (assignments.length === 0) {
     const allStudents = await User.find({ role: "Student" }).lean();
     if (allStudents.length > 0) {
        await TeacherStudent.insertMany(allStudents.map(s => ({ teacherId, studentId: s._id })));
        assignments = await TeacherStudent.find({ teacherId }).lean();
     }
  }

  const studentIds = assignments.map(a => a.studentId);
  
  const pendingProjects = await Project.find({ 
    userId: { $in: studentIds }
  }).populate("userId", "name email").sort({ createdAt: -1 }).lean();
  
  const formatted = pendingProjects.map(p => ({
    id: p._id,
    title: p.title,
    techStack: p.techStack,
    studentName: p.userId?.name || "Unknown",
    status: p.verificationStatus
  }));
  
  res.json({ projects: formatted });
});

export const verifyProject = asyncHandler(async (req, res) => {
  const { projectId, status } = req.body; // status: APPROVED or REJECTED
  
  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid verification status" });
  }

  const teacherId = req.auth.userId;
  
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  // Guard: Ensure teacher can only verify projects of students explicitly assigned to them
  const isAssigned = await TeacherStudent.exists({ teacherId, studentId: project.userId });
  if (!isAssigned) return res.status(403).json({ message: "Unauthorized to verify this project" });

  project.verificationStatus = status;
  await project.save();

  res.json({ message: "Project verification updated", project });
});
