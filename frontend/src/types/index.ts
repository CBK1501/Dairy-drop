export interface AuthUser {
  id: string;
  username: string;
  role: "admin" | "user";
  isActive: boolean;
  createdAt: string;
}

export interface Delivery {
  id: string;
  date: string;
  morningLitres: number | null;
  eveningLitres: number | null;
  totalLitres: number;
  createdAt: string;
}

export interface DeliverySummary {
  month: string;
  totalLitres: number;
  morningLitres: number;
  eveningLitres: number;
  totalCost: number;
  pricePerLitre: number;
  daysRecorded: number;
}

export interface AppSettings {
  id: string;
  pricePerLitre: number;
  updatedAt: string;
}

export interface ApiError {
  error: string;
}
