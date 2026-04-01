import { Request, Response } from "express";
import { CreateUserSchema, UpdateUserSchema } from "../validators/index.js";
import { getAllUsers, createUser, updateUser, deleteUser } from "../services/user.service.js";

export async function listUsers(req: Request, res: Response) {
  const users = await getAllUsers();
  res.json({ users });
}

export async function addUser(req: Request, res: Response) {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }
  try {
    const user = await createUser(parsed.data.username, parsed.data.password, parsed.data.role);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function editUser(req: Request, res: Response) {
  const parsed = UpdateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }
  try {
    const user = await updateUser(String(req.params.id), parsed.data as any);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function removeUser(req: Request, res: Response) {
  try {
    await deleteUser(String(req.params.id), req.user!._id.toString());
    res.json({ success: true, message: "User deleted" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
