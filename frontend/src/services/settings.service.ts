import { http } from "../lib/http";
import { AppSettings } from "../types";

export const settingsService = {
  get: () => http.get<AppSettings>("/api/settings"),

  update: (pricePerLitre: number) =>
    http.put<AppSettings>("/api/settings", { pricePerLitre }),
};
