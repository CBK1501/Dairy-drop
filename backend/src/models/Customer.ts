import { Schema, Document, model } from "mongoose";

export interface ICustomer extends Document {
  userId: string;
  name: string;
  phone: string;
  pricePerLitre: number;
  isActive: boolean;
  createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    pricePerLitre: { type: Number, required: true, default: 50 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Customer = model<ICustomer>("Customer", CustomerSchema);
