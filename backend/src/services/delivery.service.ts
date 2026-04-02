import mongoose from "mongoose";
import { Delivery } from "../models/Delivery.js";
import { Customer } from "../models/Customer.js";
import { Settings } from "../models/Settings.js";
import { DeliveryPayload, DeliverySummaryPayload } from "../types/index.js";

export function formatDelivery(d: InstanceType<typeof Delivery>): DeliveryPayload {
  const morning = d.morningLitres ?? 0;
  const evening = d.eveningLitres ?? 0;
  return {
    id: d._id.toString(),
    customerId: String(d.customerId),
    date: d.date,
    morningLitres: d.morningLitres,
    eveningLitres: d.eveningLitres,
    totalLitres: parseFloat((morning + evening).toFixed(2)),
    createdAt: (d as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

function getMonthRange(month: string): { start: string; end: string } {
  const [year, mon] = month.split("-");
  const start = `${year}-${mon}-01`;
  const lastDay = new Date(Number(year), Number(mon), 0).getDate();
  const end = `${year}-${mon}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export async function getDeliveries(
  userId: string,
  userRole: string,
  customerId: string,
  month?: string
): Promise<{ deliveries: DeliveryPayload[]; total: number }> {
  const query: Record<string, unknown> = { customerId };
  if (userRole !== "admin") query.userId = userId;
  if (month) {
    const { start, end } = getMonthRange(month);
    query.date = { $gte: start, $lte: end };
  }
  const col = mongoose.connection.collection("deliveries");
  const rows = await col.find(query).sort({ date: -1 }).toArray();
  return {
    deliveries: rows.map((d: any) => ({
      id: d._id.toString(),
      customerId: String(d.customerId),
      date: d.date,
      morningLitres: d.morningLitres ?? null,
      eveningLitres: d.eveningLitres ?? null,
      totalLitres: parseFloat(((d.morningLitres ?? 0) + (d.eveningLitres ?? 0)).toFixed(2)),
      createdAt: d.createdAt?.toISOString?.() ?? new Date().toISOString(),
    })),
    total: rows.length,
  };
}

export async function getDeliverySummary(
  userId: string,
  userRole: string,
  customerId: string,
  month?: string
): Promise<DeliverySummaryPayload> {
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);
  const { start, end } = getMonthRange(currentMonth);

  const query: Record<string, unknown> = { customerId, date: { $gte: start, $lte: end } };
  if (userRole !== "admin") query.userId = userId;

  const col = mongoose.connection.collection("deliveries");
  const rows = await col.find(query).toArray() as any[];

  let morningTotal = 0;
  let eveningTotal = 0;
  for (const r of rows) {
    morningTotal += r.morningLitres ?? 0;
    eveningTotal += r.eveningLitres ?? 0;
  }

  const customer = await Customer.findById(customerId);
  let pricePerLitre = customer?.pricePerLitre ?? 0;
  if (!pricePerLitre) {
    const settings = await Settings.findOne();
    pricePerLitre = settings?.pricePerLitre ?? 50;
  }

  const totalLitres = parseFloat((morningTotal + eveningTotal).toFixed(2));
  return {
    month: currentMonth,
    totalLitres,
    morningLitres: parseFloat(morningTotal.toFixed(2)),
    eveningLitres: parseFloat(eveningTotal.toFixed(2)),
    totalCost: parseFloat((totalLitres * pricePerLitre).toFixed(2)),
    pricePerLitre,
    daysRecorded: rows.length,
  };
}

export async function upsertDelivery(
  userId: string,
  customerId: string,
  date: string,
  morningLitres: number | null | undefined,
  eveningLitres: number | null | undefined
): Promise<DeliveryPayload> {
  const col = mongoose.connection.collection("deliveries");
  await col.updateOne(
    { userId, customerId, date },
    { $set: { morningLitres: morningLitres ?? null, eveningLitres: eveningLitres ?? null } },
    { upsert: true }
  );
  const doc = await col.findOne({ userId, customerId, date }) as any;
  return {
    id: doc._id.toString(),
    customerId: String(doc.customerId),
    date: doc.date,
    morningLitres: doc.morningLitres ?? null,
    eveningLitres: doc.eveningLitres ?? null,
    totalLitres: (doc.morningLitres ?? 0) + (doc.eveningLitres ?? 0),
    createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export async function updateDelivery(
  id: string,
  userId: string,
  userRole: string,
  date: string,
  morningLitres: number | null | undefined,
  eveningLitres: number | null | undefined
): Promise<DeliveryPayload> {
  const filter = userRole === "admin" ? { _id: new mongoose.Types.ObjectId(id) } : { _id: new mongoose.Types.ObjectId(id), userId };
  const col = mongoose.connection.collection("deliveries");
  await col.updateOne(filter, { $set: { date, morningLitres: morningLitres ?? null, eveningLitres: eveningLitres ?? null } });
  const doc = await col.findOne(filter) as any;
  if (!doc) throw new Error("Delivery not found");
  return {
    id: doc._id.toString(),
    customerId: String(doc.customerId),
    date: doc.date,
    morningLitres: doc.morningLitres ?? null,
    eveningLitres: doc.eveningLitres ?? null,
    totalLitres: (doc.morningLitres ?? 0) + (doc.eveningLitres ?? 0),
    createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export async function deleteDelivery(id: string, userId: string, userRole: string): Promise<void> {
  const col = mongoose.connection.collection("deliveries");
  const filter = userRole === "admin"
    ? { _id: new mongoose.Types.ObjectId(id) }
    : { _id: new mongoose.Types.ObjectId(id), userId };
  const result = await col.deleteOne(filter);
  if (result.deletedCount === 0) throw new Error("Delivery not found");
}
