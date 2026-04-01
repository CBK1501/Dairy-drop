import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  pricePerLitre: number;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  { pricePerLitre: { type: Number, required: true, default: 50 } },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const Settings = mongoose.model<ISettings>("Settings", SettingsSchema);
