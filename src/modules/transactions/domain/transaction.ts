import { TransactionId } from "./transactionId.js";
import { z } from "zod";
import { BankAccountId } from "../../bankAccount/domain/bankAccountId.js";
import { TransactionType } from "../infrastructure/transactionSchema.js";

export const TransactionTypeSchema = z.enum(TransactionType);
export const TransactionNameSchema = z.string().trim().min(1);
export const TransactionCategorySchema = z.string().trim().min(1);
export const TransactionAmountSchema = z.number().positive();
export const TransactionDateSchema = z.date();

export class Transaction {
  public readonly id: TransactionId;
  public readonly bankAccountId: BankAccountId;
  public name: string;
  public category: string;
  public type: TransactionType;
  public amount: number;
  public date: Date;

  constructor(
    id: TransactionId,
    bankAccountId: BankAccountId,
    name: string,
    category: string,
    type: TransactionType,
    amount: number,
    date: Date
  ) {
    this.id = id;
    this.bankAccountId = bankAccountId;
    this.name = TransactionNameSchema.parse(name);
    this.category = TransactionCategorySchema.parse(category);
    this.type = TransactionTypeSchema.parse(type);
    this.amount = TransactionAmountSchema.parse(amount);
    this.date = TransactionDateSchema.parse(date);
  }

  changeName(newName: string) {
    this.name = newName;
  }
}
