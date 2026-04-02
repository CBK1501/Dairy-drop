import { http } from "../lib/http";
import { AuthUser } from "../types";

export interface UserListResponse {
  users: AuthUser[];
}

export interface CreateUserInput {
  username: string;
  password: string;
  role: "admin" | "user";
}

export interface UpdateUserInput {
  username: string;
  password?: string | null;
  role: "admin" | "user";
  isActive: boolean;
  name?: string;
  phone?: string;
}

export interface UpdateProfileInput {
  name: string;
  phone: string;
}

export const userService = {
  getAll: () => http.get<UserListResponse>("https://dairy-drop-be.onrender.com/api/admin/users"),

  create: (data: CreateUserInput) =>
    http.post<AuthUser>("https://dairy-drop-be.onrender.com/api/admin/users", data),

  update: (id: string, data: UpdateUserInput) =>
    http.put<AuthUser>(`https://dairy-drop-be.onrender.com/api/admin/users/${id}`, data),

  remove: (id: string) =>
    http.delete<{ success: boolean }>(`https://dairy-drop-be.onrender.com/api/admin/users/${id}`),

  updateProfile: (data: UpdateProfileInput) =>
    http.put<AuthUser>("https://dairy-drop-be.onrender.com/api/users/me", data),
};
