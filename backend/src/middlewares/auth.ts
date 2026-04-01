import { Request, Response, NextFunction } from "express";
import { Session } from "../models/Session.js";
import { User, IUser } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) { res.status(401).json({ error: "Not authenticated" }); return; }

  const session = await Session.findOne({ token, expiresAt: { $gt: new Date() } });
  if (!session) { res.status(401).json({ error: "Session expired or invalid" }); return; }

  const user = await User.findOne({ _id: session.userId, isActive: true });
  if (!user) { res.status(401).json({ error: "User not found or inactive" }); return; }

  req.user = user;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, async () => {
    if (req.user?.role !== "admin") { res.status(403).json({ error: "Admin access required" }); return; }
    next();
  });
}
