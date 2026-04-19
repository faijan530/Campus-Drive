import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

export const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 8080),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? "",

  MONGODB_URI: required("MONGODB_URI"),

  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",

  UPLOAD_MAX_BYTES: Number(process.env.UPLOAD_MAX_BYTES ?? 5 * 1024 * 1024),
});

