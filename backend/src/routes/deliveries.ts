import { Router } from "express";
import {
  listDeliveries,
  summarizeDeliveries,
  createDelivery,
  editDelivery,
  removeDelivery,
} from "../controllers/delivery.controller.js";

const router = Router();

router.get("/summary", summarizeDeliveries);
router.get("/", listDeliveries);
router.post("/", createDelivery);
router.put("/:id", editDelivery);
router.delete("/:id", removeDelivery);

export default router;
