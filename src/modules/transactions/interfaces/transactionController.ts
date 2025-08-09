import { NextFunction, Request, Response } from "express";
import { AddTransaction } from "../application/addTransaction.js";
import { CalculateMonthlySavings } from "../application/calculateMonthlySavings.js";
import { InMemoryTransactionRepository } from "../infrastructure/inMemoryTransactionRepository.js";

const transactionRepo = new InMemoryTransactionRepository()
const addTransaction = new AddTransaction(transactionRepo);
const calculateSavings = new CalculateMonthlySavings(transactionRepo);

export const addTransactionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bankAccountId, name, category, amount, type, date } = req.body;
    const transaction = await addTransaction.execute(
      bankAccountId,
      name,
      category,
      amount,
      type,
      new Date(date)
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
    const { bankAccountId, year, month } = req.params;
    const savings = await calculateSavings.execute(
      bankAccountId,
      parseInt(year),
      parseInt(month)
    );
    res.status(200).json({ savings });
  } catch (err) {
    next(err);
  }
};
