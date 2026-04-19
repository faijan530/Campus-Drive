import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Roles } from "../utils/roles.js";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: Object.values(Roles), required: true, default: Roles.STUDENT },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date }
  },
  { timestamps: true }
);

userSchema.methods.verifyPassword = async function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const User = mongoose.model("User", userSchema);

