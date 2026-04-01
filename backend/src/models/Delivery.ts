import mongoose, { Schema, Document } from "mongoose";

export interface IDelivery extends Document {
  date: string;
  morningLitres: number | null;
  eveningLitres: number | null;
  createdAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    date: { type: String, required: true, unique: true },
    morningLitres: { type: Number, default: null },
    eveningLitres: { type: Number, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Delivery = mongoose.model<IDelivery>("Delivery", DeliverySchema);
