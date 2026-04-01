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
}

export const userService = {
  getAll: () => http.get<UserListResponse>("/api/admin/users"),

  create: (data: CreateUserInput) =>
    http.post<AuthUser>("/api/admin/users", data),

  update: (id: string, data: UpdateUserInput) =>
    http.put<AuthUser>(`/api/admin/users/${id}`, data),

  remove: (id: string) =>
    http.delete<{ success: boolean }>(`/api/admin/users/${id}`),
};
