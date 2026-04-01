import { Router } from "express";
import { fetchSettings, saveSettings } from "../controllers/settings.controller.js";

const router = Router();

router.get("/", fetchSettings);
router.put("/", saveSettings);

export default router;
