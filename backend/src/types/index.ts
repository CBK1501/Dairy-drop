export interface UserPayload {
  id: string;
  username: string;
  role: "admin" | "user";
  isActive: boolean;
  createdAt: string;
}

export interface DeliveryPayload {
  id: string;
  date: string;
  morningLitres: number | null;
  eveningLitres: number | null;
  totalLitres: number;
  createdAt: string;
}

export interface DeliverySummaryPayload {
  month: string;
  totalLitres: number;
  morningLitres: number;
  eveningLitres: number;
  totalCost: number;
  pricePerLitre: number;
  daysRecorded: number;
}

export interface SettingsPayload {
  id: string;
  pricePerLitre: number;
  updatedAt: string;
}
