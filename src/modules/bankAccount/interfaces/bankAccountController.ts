import { DrizzleBankAccountRepository } from "../infrastructure/drizzleBankAccountRepository.js";
import { CreateBankAccount } from "../application/createBankAccount.js";
import { BankAccountNameSchema } from "../domain/bankAccount.js";
import { NextFunction, Request, Response } from "express";
import { UserId } from "../../user/domain/userId.js";
import { BankAccountId } from "../domain/bankAccountId.js";
import { DrizzleTransactionRepository } from "../../transactions/infrastructure/drizzleTransactionRepository.js";
import { z } from "zod";
import type { ParsedQs } from "qs";
import { getAuthSession } from "../../../utils/getAuthSession.js";

const bankAccountRepo = new DrizzleBankAccountRepository();
const createBankAccount = new CreateBankAccount(bankAccountRepo);
const transactionRepo = new DrizzleTransactionRepository();

export const createBankAccountHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accountName = BankAccountNameSchema.parse(req.body.name);
    const auth = await getAuthSession(req);
    const account = await createBankAccount.execute(auth.userId, accountName);
    res.status(201).json({
      id: account.id.value,
      name: account.name,
    });
  } catch (err) {
    next(err);
  }
};

export const getBankAccountsForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = await getAuthSession(req);

    const accounts = await bankAccountRepo.findByUserId(
      new UserId(auth.userId)
    );

    res.status(200).json(
      accounts.map((a) => ({
        id: a.id.value,
        name: a.name,
      }))
    );
  } catch (err) {
    next(err);
  }
};

export const getBankAccountById = async (
  req: Request<{ bankId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = await getAuthSession(req);
    const accountId = new BankAccountId(req.params.bankId);

    const account = await bankAccountRepo.findById(accountId);
    if (!account) {
      throw new Error("notFound");
    }

    if (!account.userId.equals(new UserId(auth.userId))) {
      throw new Error("noAccess");
    }

    res.status(200).json({
      id: account.id.value,
      name: account.name,
    });
  } catch (err) {
    next(err);
  }
};

export const getAccountWithTransactionsById = async (
  req: Request<{ bankId: string }, any, any, ParsedQs & { page?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = await getAuthSession(req);
    const accountId = new BankAccountId(req.params.bankId);
    const page = z.coerce.number().optional().default(0).parse(req.query.page);

    const account = await bankAccountRepo.findById(accountId);
    if (!account) {
      throw new Error("notFound");
    }

    if (!account.userId.equals(new UserId(auth.userId))) {
      throw new Error("noAccess");
    }

    const transactions = await transactionRepo.findByBankAccountId(
      accountId,
      page
    );

    res.status(200).json({
      id: account.id.value,
      name: account.name,
      transactions: transactions.map((t) => ({
        id: t.id.value,
        name: t.name,
        category: t.category,
        type: t.type,
        amount: t.amount,
        date: t.date.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
};
