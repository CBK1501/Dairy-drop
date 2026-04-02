import { Router } from "express";
import { listUsers, addUser, editUser, removeUser } from "../controllers/user.controller.js";
import { requireAdmin } from "../middlewares/auth.js";
import { Customer } from "../models/Customer.js";

const router = Router();

router.get("/users", requireAdmin, listUsers);
router.post("/users", requireAdmin, addUser);
router.put("/users/:id", requireAdmin, editUser);
router.delete("/users/:id", requireAdmin, removeUser);

// Admin: get customer count per user
router.get("/stats", requireAdmin, async (_req, res) => {
  const stats = await Customer.aggregate([
    { $group: { _id: "$userId", customerCount: { $sum: 1 } } },
  ]);
  const map: Record<string, number> = {};
  for (const s of stats) map[s._id] = s.customerCount;
  res.json({ stats: map });
});

export default router;
