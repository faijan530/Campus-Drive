import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Resume } from "../models/Resume.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, notFound } from "../utils/httpError.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.resolve(__dirname, "../../uploads/resumes");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw badRequest("PDF file is required");

  const userId = req.auth.userId;

  // Delete old file if replacing
  const existing = await Resume.findOne({ userId });
  if (existing) {
    const oldPath = path.join(UPLOAD_DIR, existing.filename);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    await Resume.deleteOne({ userId });
  }

  const resume = await Resume.create({
    userId,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date(),
  });

  res.status(201).json({
    resume: {
      filename: resume.originalName,
      uploadedAt: resume.uploadedAt,
      size: resume.size,
    },
  });
});

export const getResumeMeta = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ userId: req.auth.userId }).lean();
  if (!resume) return res.json({ resume: null });
  res.json({
    resume: {
      filename: resume.originalName,
      uploadedAt: resume.uploadedAt,
      size: resume.size,
    },
  });
});

export const downloadResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ userId: req.auth.userId }).lean();
  if (!resume) throw notFound("No resume uploaded");

  const filePath = path.join(UPLOAD_DIR, resume.filename);
  if (!fs.existsSync(filePath)) throw notFound("Resume file not found on server");

  res.setHeader("Content-Disposition", `attachment; filename="${resume.originalName}"`);
  res.setHeader("Content-Type", "application/pdf");
  fs.createReadStream(filePath).pipe(res);
});
