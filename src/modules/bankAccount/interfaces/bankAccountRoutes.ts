import { Router } from "express";
import {
  createBankAccountHandler,
  getAccountWithTransactionsById,
  getBankAccountById,
  getBankAccountsForUser,
} from "./bankAccountController.js";

const router = Router();

router.post("/", createBankAccountHandler);

router.get("/", getBankAccountsForUser);

router.get("/:bankId", getBankAccountById);

router.get("/:bankId/transactions", getAccountWithTransactionsById);

export default router;
