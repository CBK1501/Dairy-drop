import { Delivery } from "../models/Delivery.js";
import { Settings } from "../models/Settings.js";
import { DeliveryPayload, DeliverySummaryPayload } from "../types/index.js";

export function formatDelivery(d: InstanceType<typeof Delivery>): DeliveryPayload {
  return {
    id: d._id.toString(),
    date: d.date,
    morningLitres: d.morningLitres,
    eveningLitres: d.eveningLitres,
    totalLitres: (d.morningLitres ?? 0) + (d.eveningLitres ?? 0),
    createdAt: (d as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

function getMonthRange(month: string): { start: string; end: string } {
  const [year, mon] = month.split("-");
  const start = `${year}-${mon}-01`;
  const end = new Date(Number(year), Number(mon), 1).toISOString().slice(0, 10);
  return { start, end };
}

export async function getDeliveries(month?: string): Promise<{ deliveries: DeliveryPayload[]; total: number }> {
  let query: Record<string, unknown> = {};
  if (month) {
    const { start, end } = getMonthRange(month);
    query = { date: { $gte: start, $lt: end } };
  }
  const rows = await Delivery.find(query).sort({ date: -1 });
  return { deliveries: rows.map(formatDelivery), total: rows.length };
}

export async function getDeliverySummary(month?: string): Promise<DeliverySummaryPayload> {
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);
  const { start, end } = getMonthRange(currentMonth);

  const rows = await Delivery.find({ date: { $gte: start, $lt: end } });
  let morningTotal = 0;
  let eveningTotal = 0;
  for (const r of rows) {
    morningTotal += r.morningLitres ?? 0;
    eveningTotal += r.eveningLitres ?? 0;
  }

  const settings = await Settings.findOne();
  const pricePerLitre = settings?.pricePerLitre ?? 50;
  const totalLitres = morningTotal + eveningTotal;

  return {
    month: currentMonth,
    totalLitres,
    morningLitres: morningTotal,
    eveningLitres: eveningTotal,
    totalCost: parseFloat((totalLitres * pricePerLitre).toFixed(2)),
    pricePerLitre,
    daysRecorded: rows.length,
  };
}

export async function upsertDelivery(
  date: string,
  morningLitres: number | null | undefined,
  eveningLitres: number | null | undefined
): Promise<DeliveryPayload> {
  const doc = await Delivery.findOneAndUpdate(
    { date },
    { morningLitres: morningLitres ?? null, eveningLitres: eveningLitres ?? null },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return formatDelivery(doc!);
}

export async function updateDelivery(
  id: string,
  date: string,
  morningLitres: number | null | undefined,
  eveningLitres: number | null | undefined
): Promise<DeliveryPayload> {
  const doc = await Delivery.findByIdAndUpdate(
    id,
    { date, morningLitres: morningLitres ?? null, eveningLitres: eveningLitres ?? null },
    { new: true }
  );
  if (!doc) throw new Error("Delivery not found");
  return formatDelivery(doc);
}

export async function deleteDelivery(id: string): Promise<void> {
  const deleted = await Delivery.findByIdAndDelete(id);
  if (!deleted) throw new Error("Delivery not found");
}
