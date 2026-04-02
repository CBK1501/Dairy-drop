import { http } from "../lib/http";
import { Delivery, DeliverySummary } from "../types";

export interface DeliveryListResponse {
  deliveries: Delivery[];
  total: number;
}

export interface CreateDeliveryInput {
  date: string;
  morningLitres: number | null;
  eveningLitres: number | null;
}

const base = (customerId: string) => `/api/customers/${customerId}/deliveries`;

export const deliveryService = {
  getAll: (customerId: string, month?: string) =>
    http.get<DeliveryListResponse>(`${base(customerId)}${month ? `?month=${month}` : ""}`),

  getSummary: (customerId: string, month?: string) =>
    http.get<DeliverySummary>(`${base(customerId)}/summary${month ? `?month=${month}` : ""}`),

  create: (customerId: string, data: CreateDeliveryInput) =>
    http.post<Delivery>(base(customerId), data),

  update: (customerId: string, id: string, data: CreateDeliveryInput) =>
    http.put<Delivery>(`${base(customerId)}/${id}`, data),

  remove: (customerId: string, id: string) =>
    http.delete<{ success: boolean }>(`${base(customerId)}/${id}`),
};
