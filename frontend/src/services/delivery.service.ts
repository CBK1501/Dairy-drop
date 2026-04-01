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

export const deliveryService = {
  getAll: (month?: string) =>
    http.get<DeliveryListResponse>(`/api/deliveries${month ? `?month=${month}` : ""}`),

  getSummary: (month?: string) =>
    http.get<DeliverySummary>(`/api/deliveries/summary${month ? `?month=${month}` : ""}`),

  create: (data: CreateDeliveryInput) =>
    http.post<Delivery>("/api/deliveries", data),

  update: (id: string, data: CreateDeliveryInput) =>
    http.put<Delivery>(`/api/deliveries/${id}`, data),

  remove: (id: string) =>
    http.delete<{ success: boolean }>(`/api/deliveries/${id}`),
};
