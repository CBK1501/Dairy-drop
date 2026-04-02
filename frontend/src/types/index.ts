export interface AuthUser {
  id: string;
  username: string;
  role: "admin" | "user";
  isActive: boolean;
  name: string;
  phone: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  pricePerLitre: number;
  isActive: boolean;
  createdAt: string;
}

export interface Delivery {
  id: string;
  customerId: string;
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
