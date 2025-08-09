import { TransactionId } from "./transactionId.js";
import { z } from "zod";
import { BankAccountId } from "../../bankAccount/domain/bankAccountId.js";

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

const TransactionTypeSchema = z.enum(TransactionType);
const TransactionNameSchema = z.string().trim().min(1);
const TransactionCategorySchema = z.string().trim().min(1);
const TransactionAmountSchema = z.number().min(0);
const TransactionDateSchema = z.date();

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
