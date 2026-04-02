import { Router } from "express";
import { listCustomers, addCustomer, editCustomer, removeCustomer } from "../controllers/customer.controller.js";

const router = Router();

router.get("/", listCustomers);
router.post("/", addCustomer);
router.put("/:id", editCustomer);
router.delete("/:id", removeCustomer);

export default router;
