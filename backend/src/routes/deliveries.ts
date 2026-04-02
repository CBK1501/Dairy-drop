import { Router } from "express";
import { listDeliveries, summarizeDeliveries, createDelivery, editDelivery, removeDelivery } from "../controllers/delivery.controller.js";

const router = Router({ mergeParams: true });

router.get("/", listDeliveries);
router.get("/summary", summarizeDeliveries);
router.post("/", createDelivery);
router.put("/:id", editDelivery);
router.delete("/:id", removeDelivery);

export default router;
