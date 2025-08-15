import { Router } from "express";
import {
  createBankAccountHandler,
  getBankAccountById,
  getBankAccountsForUser,
} from "./bankAccountController.js";

const router = Router();

router.post("/", createBankAccountHandler);

router.get("/", getBankAccountsForUser);

router.get("/:bankId", getBankAccountById);

export default router;
