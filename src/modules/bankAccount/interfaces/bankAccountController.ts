import { DrizzleBankAccountRepository } from "../infrastructure/drizzleBankAccountRepository.js";
import { CreateBankAccount } from "../application/createBankAccount.js";
import { z } from "zod";
import { BankAccountNameSchema } from "../domain/bankAccount.js";
import { NextFunction, Request, Response } from "express";

const bankAccountRepo = new DrizzleBankAccountRepository();
const createBankAccount = new CreateBankAccount(bankAccountRepo);

const createBankAccountSchema = z.object({
  userId: z.string(),
  name: BankAccountNameSchema,
});

export const createBankAccountHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createBankAccountSchema.parse(req.body);
    const account = await createBankAccount.execute(data.userId, data.name);
    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
};
