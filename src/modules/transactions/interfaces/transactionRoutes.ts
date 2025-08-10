import { Router } from "express";
import {
  addTransactionHandler,
  calculateSavingsHandler,
} from "./transactionController.js";

const router = Router();

router.post("/", addTransactionHandler);
router.get("/savings", calculateSavingsHandler);

export default router;
