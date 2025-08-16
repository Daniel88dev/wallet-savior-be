import { DrizzleBankAccountRepository } from "../infrastructure/drizzleBankAccountRepository.js";
import { CreateBankAccount } from "../application/createBankAccount.js";
import { z } from "zod";
import { BankAccountNameSchema } from "../domain/bankAccount.js";
import { NextFunction, Request, Response } from "express";
import { getAuthSession } from "../../../utils/auth.js";
import { UserId } from "../../user/domain/userId.js";
import { BankAccountId } from "../domain/bankAccountId.js";

const bankAccountRepo = new DrizzleBankAccountRepository();
const createBankAccount = new CreateBankAccount(bankAccountRepo);

export const createBankAccountHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accountName = BankAccountNameSchema.parse(req.body.name);
    const auth = await getAuthSession(req);
    const account = await createBankAccount.execute(auth.userId, accountName);
    res.status(201).json(account);
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

    res.status(200).json(accounts);
  } catch (err) {
    next(err);
  }
};

export const getBankAccountById = async (
  req: Request,
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

    res.status(200).json(account);
  } catch (err) {
    next(err);
  }
};
