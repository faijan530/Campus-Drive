import { z } from "zod";
import { User } from "../models/User.js";
import { signAccessToken } from "../services/tokenService.js";
import { badRequest, unauthorized } from "../utils/httpError.js";
import { Roles } from "../utils/roles.js";

// role is intentionally excluded — all public registrations are forced to Student
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  name: z.string().min(2).max(80),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authController = {
  async register(req, res) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest("Validation error", parsed.error.flatten());

    const { email, password, name } = parsed.data;
    const exists = await User.findOne({ email }).lean();
    if (exists) throw badRequest("Email already in use");

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      name,
      role: Roles.STUDENT, // always Student — role escalation is not permitted via registration
      isActive: true,
    });

    const token = signAccessToken({ userId: user._id.toString(), role: user.role });
    res.status(201).json({
      token,
      user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
    });
  },

  async login(req, res) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest("Validation error", parsed.error.flatten());

    const { email, password } = parsed.data;
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !user.isActive) throw unauthorized("Invalid credentials");

    const ok = await user.verifyPassword(password);
    if (!ok) throw unauthorized("Invalid credentials");

    const token = signAccessToken({ userId: user._id.toString(), role: user.role });
    res.json({
      token,
      user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
    });
  },

  async me(req, res) {
    const user = await User.findById(req.auth.userId).select('email name role isActive');
    res.json({ 
      user: { 
        id: req.auth.userId, 
        email: user?.email, 
        name: user?.name, 
        role: req.auth.role,
        isActive: user?.isActive
      } 
    });
  },

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      throw badRequest("Invalid password payload. Must be at least 8 chars.");
    }

    const user = await User.findById(req.auth.userId).select("+passwordHash");
    if (!user) throw badRequest("User not found");

    const valid = await user.verifyPassword(currentPassword);
    if (!valid) throw unauthorized("Incorrect current password.");

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    res.json({ message: "Password updated successfully" });
  }
};

