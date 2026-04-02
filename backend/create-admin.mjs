import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI missing in .env"); process.exit(1); }

await mongoose.connect(uri);
console.log("[db] Connected to:", uri);

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  passwordHash: String,
  role: String,
  isActive: Boolean,
  name: { type: String, default: "" },
  phone: { type: String, default: "" },
}, { timestamps: { createdAt: true, updatedAt: false } });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

await User.deleteOne({ username: "admin" });
const passwordHash = await bcrypt.hash("admin123", 10);
await User.create({ username: "admin", password: "admin123", passwordHash, role: "admin", isActive: true });

console.log("✅ Admin created — username: admin  password: admin123");
await mongoose.disconnect();
