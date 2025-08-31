import { NextFunction, Request, Response } from "express";
import { AddTransaction } from "../application/addTransaction.js";
import { CalculateMonthlySavings } from "../application/calculateMonthlySavings.js";
import { DrizzleTransactionRepository } from "../infrastructure/drizzleTransactionRepository.js";
import { z } from "zod";
import {
  TransactionAmountSchema,
  TransactionCategorySchema,
  TransactionDateSchema,
  TransactionNameSchema,
  TransactionTypeSchema,
} from "../domain/transaction.js";
import { getAuthSession } from "../../../utils/getAuthSession.js";
import { DrizzleBankAccountRepository } from "../../bankAccount/infrastructure/drizzleBankAccountRepository.js";
import { BankAccountId } from "../../bankAccount/domain/bankAccountId.js";
import { ProjectError } from "../../../middleware/errorMiddleware.js";

const transactionRepo = new DrizzleTransactionRepository();
const addTransaction = new AddTransaction(transactionRepo);
const calculateSavings = new CalculateMonthlySavings(transactionRepo);
const bankAccountRepo = new DrizzleBankAccountRepository();

const transactionSchema = z.object({
  bankAccountId: z.uuid(),
  amount: TransactionAmountSchema,
  name: TransactionNameSchema,
  category: TransactionCategorySchema,
  type: TransactionTypeSchema,
  date: TransactionDateSchema,
});

export const addTransactionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = await getAuthSession(req);
    const data = transactionSchema.parse(req.body);
    const account = await bankAccountRepo.findById(
      new BankAccountId(data.bankAccountId)
    );

    if (!account) {
      throw new ProjectError({
        name: "notFound",
        message: "Bank Account not found",
      });
    }

    if (auth.userId !== account.userId.value) {
      throw new ProjectError({
        name: "noAccess",
        message: "No Access to related Bank Account",
      });
    }

    const transaction = await addTransaction.execute(
      data.bankAccountId,
      data.name,
      data.category,
      data.amount,
      data.type,
      data.date
    );
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};

export const calculateSavingsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await getAuthSession(req);
    const querySchema = z.object({
      bankAccountId: z.uuid(),
      year: z.string().transform(Number),
      month: z.string().transform(Number),
    });
    const { bankAccountId, year, month } = querySchema.parse(req.params);
    const savings = await calculateSavings.execute(bankAccountId, year, month);
    res.status(200).json({ savings });
  } catch (err) {
    next(err);
  }
};
