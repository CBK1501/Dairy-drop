import { http } from "../lib/http";
import { Customer } from "../types";

export interface CreateCustomerInput {
  name: string;
  phone: string;
  pricePerLitre: number;
}

export interface UpdateCustomerInput {
  name: string;
  phone: string;
  pricePerLitre: number;
  isActive: boolean;
}

export const customerService = {
  getAll: () => http.get<{ customers: Customer[] }>("https://dairy-drop-be.onrender.com/api/customers"),

  create: (data: CreateCustomerInput) =>
    http.post<Customer>("https://dairy-drop-be.onrender.com/api/customers", data),

  update: (id: string, data: UpdateCustomerInput) =>
    http.put<Customer>(`https://dairy-drop-be.onrender.com/api/customers/${id}`, data),

  remove: (id: string) =>
    http.delete<{ success: boolean }>(`https://dairy-drop-be.onrender.com/api/customers/${id}`),
};
