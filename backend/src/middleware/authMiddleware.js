import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { unauthorized } from "../utils/httpError.js";
import { User } from "../models/User.js";

function extractBearer(req) {
  // Support ?token= query param for direct browser download links
  if (req.query?.token) return req.query.token;
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export async function requireAuth(req, _res, next) {
  try {
    const token = extractBearer(req);
    if (!token) return next(unauthorized("Missing Authorization Bearer token"));

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.sub).lean();
    if (!user || !user.isActive) return next(unauthorized("Invalid user"));

    req.auth = { userId: user._id.toString(), role: user.role, email: user.email, name: user.name };
    return next();
  } catch {
    return next(unauthorized("Invalid or expired token"));
  }
}

