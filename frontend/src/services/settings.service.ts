import { http } from "../lib/http";
import { AppSettings } from "../types";

export const settingsService = {
  get: () => http.get<AppSettings>("https://dairy-drop-be.onrender.com/api/settings"),

  update: (pricePerLitre: number) =>
    http.put<AppSettings>("https://dairy-drop-be.onrender.com/api/settings", { pricePerLitre }),
};
