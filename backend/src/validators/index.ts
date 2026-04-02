import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const CreateUserSchema = z.object({
  username: z.string().min(1).trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "user"]),
});

export const UpdateUserSchema = z.object({
  username: z.string().min(1).trim(),
  password: z.string().min(6).nullable().optional(),
  role: z.enum(["admin", "user"]),
  isActive: z.boolean(),
  name: z.string().optional(),
  phone: z.string().optional(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
});

export const CustomerSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  phone: z.string().min(1, "Phone is required").trim(),
  pricePerLitre: z.number().positive("Price must be greater than 0"),
});

export const UpdateCustomerSchema = z.object({
  name: z.string().min(1).trim(),
  phone: z.string().min(1).trim(),
  pricePerLitre: z.number().positive(),
  isActive: z.boolean(),
});

export const DeliverySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  morningLitres: z.number().min(0).nullable().optional(),
  eveningLitres: z.number().min(0).nullable().optional(),
});

export const SettingsSchema = z.object({
  pricePerLitre: z.number().positive("Price must be greater than 0"),
});
