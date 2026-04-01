import { Request, Response } from "express";
import { SettingsSchema } from "../validators/index.js";
import { getSettings, updateSettings } from "../services/settings.service.js";

export async function fetchSettings(req: Request, res: Response) {
  const settings = await getSettings();
  res.json(settings);
}

export async function saveSettings(req: Request, res: Response) {
  const parsed = SettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }
  const settings = await updateSettings(parsed.data.pricePerLitre);
  res.json(settings);
}
