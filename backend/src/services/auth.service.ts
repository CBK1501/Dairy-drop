import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { User, IUser } from "../models/User.js";
import { Session } from "../models/Session.js";
import { UserPayload } from "../types/index.js";

export function formatUser(u: IUser): UserPayload {
  return {
    id: u._id.toString(),
    username: u.username,
    role: u.role,
    isActive: u.isActive,
    name: u.name ?? "",
    phone: u.phone ?? "",
    createdAt: (u as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

function sessionExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}

export async function loginUser(username: string, password: string) {
  const user = await User.findOne({ username: username.trim() });
  if (!user || !user.isActive) throw new Error("Invalid username or password");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid username or password");

  const token = randomBytes(32).toString("hex");
  await Session.create({ token, userId: user._id, expiresAt: sessionExpiry() });

  return { token, user: formatUser(user) };
}

export async function logoutUser(token: string) {
  await Session.deleteOne({ token });
}

export async function getUserByToken(token: string): Promise<UserPayload> {
  const session = await Session.findOne({ token, expiresAt: { $gt: new Date() } });
  if (!session) throw new Error("Session expired or invalid");

  const user = await User.findOne({ _id: session.userId, isActive: true });
  if (!user) throw new Error("User not found or inactive");

  return formatUser(user);
}
