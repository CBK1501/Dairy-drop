import { Customer } from "../models/Customer.js";
import { CustomerPayload } from "../types/index.js";

function formatCustomer(c: InstanceType<typeof Customer>): CustomerPayload {
  return {
    id: c._id.toString(),
    userId: String(c.userId),
    name: c.name,
    phone: c.phone,
    pricePerLitre: c.pricePerLitre,
    isActive: c.isActive,
    createdAt: (c as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export async function getCustomers(userId: string, userRole: string): Promise<CustomerPayload[]> {
  const query = userRole === "admin" ? {} : { userId };
  const customers = await Customer.find(query).sort({ name: 1 });
  return customers.map(formatCustomer);
}

export async function createCustomer(
  userId: string,
  name: string,
  phone: string,
  pricePerLitre: number
): Promise<CustomerPayload> {
  const customer = await Customer.create({ userId, name: name.trim(), phone: phone.trim(), pricePerLitre });
  return formatCustomer(customer);
}

export async function updateCustomer(
  id: string,
  userId: string,
  userRole: string,
  data: { name: string; phone: string; pricePerLitre: number; isActive: boolean }
): Promise<CustomerPayload> {
  const filter = userRole === "admin" ? { _id: id } : { _id: id, userId };
  const customer = await Customer.findOneAndUpdate(
    filter,
    { name: data.name.trim(), phone: data.phone.trim(), pricePerLitre: data.pricePerLitre, isActive: data.isActive },
    { new: true }
  );
  if (!customer) throw new Error("Customer not found");
  return formatCustomer(customer);
}

export async function deleteCustomer(id: string, userId: string, userRole: string): Promise<void> {
  const filter = userRole === "admin" ? { _id: id } : { _id: id, userId };
  const deleted = await Customer.findOneAndDelete(filter);
  if (!deleted) throw new Error("Customer not found");
}
