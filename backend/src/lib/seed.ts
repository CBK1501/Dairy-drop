import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

export async function seedAdminUser() {
  const exists = await User.findOne({ username: "admin" });
  if (exists) return;
  const passwordHash = await bcrypt.hash("admin123", 10);
  await User.create({ username: "admin", passwordHash, role: "admin", isActive: true });
  console.log("[seed] Default admin created — username: admin, password: admin123");
}
