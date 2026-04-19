import multer from "multer";
import path from "path";
import { UPLOAD_DIR } from "../controllers/resumeController.js";
import { env } from "../config/env.js";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(12).toString("hex");
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

function pdfFilter(_req, file, cb) {
  if (file.mimetype === "application/pdf") return cb(null, true);
  cb(new Error("Only PDF files are allowed"), false);
}

export const resumeUpload = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: env.UPLOAD_MAX_BYTES || 5 * 1024 * 1024 },
});
