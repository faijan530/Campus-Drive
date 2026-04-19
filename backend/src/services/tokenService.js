import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken({ userId, role }) {
  return jwt.sign(
    {
      role,
    },
    env.JWT_SECRET,
    {
      subject: userId,
      expiresIn: env.JWT_EXPIRES_IN,
    }
  );
}

