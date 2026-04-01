import { Settings } from "../models/Settings.js";
import { SettingsPayload } from "../types/index.js";

function formatSettings(s: InstanceType<typeof Settings>): SettingsPayload {
  return {
    id: s._id.toString(),
    pricePerLitre: s.pricePerLitre,
    updatedAt: (s as any).updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export async function getSettings(): Promise<SettingsPayload> {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({ pricePerLitre: 50 });
  return formatSettings(settings);
}

export async function updateSettings(pricePerLitre: number): Promise<SettingsPayload> {
  const settings = await Settings.findOneAndUpdate(
    {},
    { pricePerLitre },
    { upsert: true, new: true }
  );
  return formatSettings(settings!);
}
