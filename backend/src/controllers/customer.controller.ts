import { Request, Response } from "express";
import { CustomerSchema, UpdateCustomerSchema } from "../validators/index.js";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "../services/customer.service.js";

export async function listCustomers(req: Request, res: Response) {
  const customers = await getCustomers(req.user!._id.toString(), req.user!.role);
  res.json({ customers });
}

export async function addCustomer(req: Request, res: Response) {
  const parsed = CustomerSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
  try {
    const customer = await createCustomer(req.user!._id.toString(), parsed.data.name, parsed.data.phone, parsed.data.pricePerLitre);
    res.status(201).json(customer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function editCustomer(req: Request, res: Response) {
  const parsed = UpdateCustomerSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
  try {
    const customer = await updateCustomer(String(req.params.id), req.user!._id.toString(), req.user!.role, parsed.data as any);
    res.json(customer);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function removeCustomer(req: Request, res: Response) {
  try {
    await deleteCustomer(String(req.params.id), req.user!._id.toString(), req.user!.role);
    res.json({ success: true });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}
