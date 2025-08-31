import { UserId } from "../../user/domain/userId.js";
import { BankAccountId } from "./bankAccountId.js";
import { z } from "zod";
import { CurrencyType } from "../infrastructure/bankAccountSchema.js";

export const BankAccountNameSchema = z.string().trim().min(1);
export const BankAccountOverdraftSchema = z.number().min(0);
export const BankAccountCurrencySchema = z.enum(CurrencyType);
export const BankAccountBalanceSchema = z.number().min(0);

export class BankAccount {
  public readonly id: BankAccountId;
  public readonly userId: UserId;
  public name: string;
  public overdraft: number;
  public currency: CurrencyType;
  public balance: number;
  constructor(
    id: BankAccountId,
    userId: UserId,
    name: string,
    overdraft: number = 0,
    currency: CurrencyType,
    balance: number
  ) {
    this.id = id;
    this.userId = userId;
    this.name = BankAccountNameSchema.parse(name);
    this.overdraft = BankAccountOverdraftSchema.parse(overdraft);
    this.currency = BankAccountCurrencySchema.parse(currency);
    this.balance = BankAccountBalanceSchema.parse(balance);
  }
}
