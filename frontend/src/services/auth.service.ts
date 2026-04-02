import { http } from "../lib/http";
import { AuthUser } from "../types";

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  login: (username: string, password: string) =>
    http.post<LoginResponse>("https://dairy-drop-be.onrender.com/api/auth/login", { username, password }),

  logout: () => http.post<void>("https://dairy-drop-be.onrender.com/api/auth/logout", {}),

  getMe: () => http.get<AuthUser>("https://dairy-drop-be.onrender.com/api/auth/me"),
};
