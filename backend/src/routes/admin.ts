import { Router } from "express";
import { listUsers, addUser, editUser, removeUser } from "../controllers/user.controller.js";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/users", requireAdmin, listUsers);
router.post("/users", requireAdmin, addUser);
router.put("/users/:id", requireAdmin, editUser);
router.delete("/users/:id", requireAdmin, removeUser);

export default router;
