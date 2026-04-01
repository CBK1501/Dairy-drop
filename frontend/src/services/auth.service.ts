import { http } from "../lib/http";
import { AuthUser } from "../types";

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  login: (username: string, password: string) =>
    http.post<LoginResponse>("/api/auth/login", { username, password }),

  logout: () => http.post<void>("/api/auth/logout", {}),

  getMe: () => http.get<AuthUser>("/api/auth/me"),
};
