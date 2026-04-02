import { Router } from "express";
import authRouter from "./auth.js";
import adminRouter from "./admin.js";
import customersRouter from "./customers.js";
import deliveriesRouter from "./deliveries.js";
import settingsRouter from "./settings.js";
import { requireAuth } from "../middlewares/auth.js";
import { getMe, updateMe } from "../controllers/user.controller.js";

const router = Router();

router.get("/healthz", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/customers", requireAuth, customersRouter);
router.use("/customers/:customerId/deliveries", requireAuth, deliveriesRouter);
router.use("/settings", requireAuth, settingsRouter);
router.get("/users/me", requireAuth, getMe);
router.put("/users/me", requireAuth, updateMe);

export default router;
