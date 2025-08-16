import { Router } from "express";
import {
  createBankAccountHandler,
  getAccountWithTransactionsById,
  getBankAccountById,
  getBankAccountsForUser,
} from "./bankAccountController.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BankAccount:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the bank account
 */

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create a bank account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BankAccount'
 *     responses:
 *       '201':
 *         description: Bank account created successfully
 */

router.post("/", createBankAccountHandler);

router.get("/", getBankAccountsForUser);

router.get("/:bankId", getBankAccountById);

router.get("/:bankId/transactions", getAccountWithTransactionsById);

export default router;
