import { Request, Response } from "express";
import { DeliverySchema } from "../validators/index.js";
import { getDeliveries, getDeliverySummary, upsertDelivery, updateDelivery, deleteDelivery } from "../services/delivery.service.js";

export async function listDeliveries(req: Request, res: Response) {
  const userId = req.user!._id.toString();
  const userRole = req.user!.role;
  const customerId = String(req.params.customerId);
  const month = req.query.month as string | undefined;
  const result = await getDeliveries(userId, userRole, customerId, month);
  res.json(result);
}

export async function summarizeDeliveries(req: Request, res: Response) {
  const userId = req.user!._id.toString();
  const userRole = req.user!.role;
  const customerId = String(req.params.customerId);
  const month = req.query.month as string | undefined;
  const result = await getDeliverySummary(userId, userRole, customerId, month);
  res.json(result);
}

export async function createDelivery(req: Request, res: Response) {
  const parsed = DeliverySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
  const userId = req.user!._id.toString();
  const customerId = String(req.params.customerId);
  const doc = await upsertDelivery(userId, customerId, parsed.data.date, parsed.data.morningLitres, parsed.data.eveningLitres);
  res.status(201).json(doc);
}

export async function editDelivery(req: Request, res: Response) {
  const parsed = DeliverySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
  try {
    const doc = await updateDelivery(String(req.params.id), req.user!._id.toString(), req.user!.role, parsed.data.date, parsed.data.morningLitres, parsed.data.eveningLitres);
    res.json(doc);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function removeDelivery(req: Request, res: Response) {
  try {
    await deleteDelivery(String(req.params.id), req.user!._id.toString(), req.user!.role);
    res.json({ success: true });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}
