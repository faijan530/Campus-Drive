import "../src/config/env.js";
import { connectDb } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { Profile } from "../src/models/Profile.js";
import { Skill } from "../src/models/Skill.js";
import { Project } from "../src/models/Project.js";
import { Roles } from "../src/utils/roles.js";

/**
 * Seeds realistic data for the module (no lorem, recruiter-friendly).
 * Run: npm run seed
 */

async function main() {
  await connectDb();

  const email = "student.isha@campusdrive.ai";
  let user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    const passwordHash = await User.hashPassword("CampusDrive@123");
    user = await User.create({
      email,
      passwordHash,
      name: "Isha Verma",
      role: Roles.STUDENT,
      isActive: true,
    });
  }

  const adminEmail = "admin@campusdrive.ai";
  let adminUser = await User.findOne({ email: adminEmail }).select("+passwordHash");
  if (!adminUser) {
    const adminPasswordHash = await User.hashPassword("Admin@1234");
    adminUser = await User.create({
      email: adminEmail,
      passwordHash: adminPasswordHash,
      name: "System Admin",
      role: Roles.ADMIN,
      isActive: true,
    });
  }

  await Profile.findOneAndUpdate(
    { userId: user._id },
    {
      headline: "Final-year CSE student focused on backend systems and clean APIs",
      academic: {
        college: "National Institute of Technology, Trichy",
        department: "Computer Science & Engineering",
        degree: "B.Tech",
        batchYear: 2026,
        cgpa: 8.4,
        verified: true,
      },
    },
    { upsert: true, new: true }
  );

  await Skill.deleteMany({ userId: user._id });
  await Skill.insertMany([
    { userId: user._id, name: "Node.js", level: "Advanced", source: "Project" },
    { userId: user._id, name: "Express.js", level: "Advanced", source: "Project" },
    { userId: user._id, name: "MongoDB", level: "Intermediate", source: "Project" },
    { userId: user._id, name: "React", level: "Intermediate", source: "Project" },
    { userId: user._id, name: "DSA", level: "Intermediate", source: "Test" },
    { userId: user._id, name: "Git", level: "Intermediate", source: "Project" }
  ]);

  await Project.deleteMany({ userId: user._id });
  await Project.insertMany([
    {
      userId: user._id,
      title: "Campus Placement Tracker",
      description: "Built a role-based web app for drive listings, applications, and approvals with JWT auth and audit-friendly APIs.",
      techStack: ["React", "Express", "MongoDB", "JWT"],
      status: "Completed",
      githubUrl: "https://github.com/example/campus-placement-tracker",
      liveUrl: ""
    },
    {
      userId: user._id,
      title: "Resume Parser Service",
      description: "Implemented a PDF ingestion pipeline that stores metadata, validates file types, and exposes download-safe endpoints.",
      techStack: ["Node.js", "Multer", "MongoDB"],
      status: "In Progress",
      githubUrl: "",
      liveUrl: ""
    }
  ]);

  // eslint-disable-next-line no-console
  console.log("[seed] created/updated student:", { email, password: "CampusDrive@123" });
  console.log("[seed] created/updated admin:", { email: adminEmail, password: "Admin@1234" });
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[seed] failed", err);
  process.exit(1);
});

