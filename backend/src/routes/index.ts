import { Router } from "express";
import authRouter from "./auth.js";
import adminRouter from "./admin.js";
import deliveriesRouter from "./deliveries.js";
import settingsRouter from "./settings.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/healthz", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/deliveries", requireAuth, deliveriesRouter);
router.use("/settings", requireAuth, settingsRouter);

export default router;
