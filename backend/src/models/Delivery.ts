import { Schema, Document, model } from "mongoose";

export interface IDelivery extends Document {
  userId: string;
  customerId: string;
  date: string;
  morningLitres: number | null;
  eveningLitres: number | null;
  createdAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    userId: { type: String, required: true },
    customerId: { type: String, required: true },
    date: { type: String, required: true },
    morningLitres: { type: Number, default: null },
    eveningLitres: { type: Number, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

DeliverySchema.index({ userId: 1, customerId: 1, date: 1 }, { unique: true });

export const Delivery = model<IDelivery>("Delivery", DeliverySchema);
