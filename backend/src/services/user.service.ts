import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { UserPayload } from "../types/index.js";
import { formatUser } from "./auth.service.js";

export async function getAllUsers(): Promise<UserPayload[]> {
  const users = await User.find().sort({ createdAt: 1 });
  return users.map(formatUser);
}

export async function createUser(
  username: string,
  password: string,
  role: "admin" | "user"
): Promise<UserPayload> {
  const existing = await User.findOne({ username: username.trim() });
  if (existing) throw new Error("Username already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username: username.trim(), passwordHash, role });
  return formatUser(user);
}

export async function updateUser(
  id: string,
  data: { username: string; password?: string | null; role: "admin" | "user"; isActive: boolean }
): Promise<UserPayload> {
  const update: Record<string, unknown> = {
    username: data.username.trim(),
    role: data.role,
    isActive: data.isActive,
  };
  if (data.password) update.passwordHash = await bcrypt.hash(data.password, 10);

  const user = await User.findByIdAndUpdate(id, update, { new: true });
  if (!user) throw new Error("User not found");
  return formatUser(user);
}

export async function deleteUser(id: string, requesterId: string): Promise<void> {
  if (requesterId === id) throw new Error("Cannot delete your own account");
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) throw new Error("User not found");
}
