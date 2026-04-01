import { Request, Response } from "express";
import { LoginSchema } from "../validators/index.js";
import { loginUser, logoutUser, getUserByToken } from "../services/auth.service.js";

export async function login(req: Request, res: Response) {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }
  try {
    const result = await loginUser(parsed.data.username, parsed.data.password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function logout(req: Request, res: Response) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) await logoutUser(token);
  res.json({ success: true, message: "Logged out" });
}

export async function getMe(req: Request, res: Response) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) { res.status(401).json({ error: "Not authenticated" }); return; }
  try {
    const user = await getUserByToken(token);
    res.json(user);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}
