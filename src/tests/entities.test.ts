import { describe, expect, it } from "vitest";
import { BankAccount } from "../modules/bankAccount/domain/bankAccount.js";
import { BankAccountId } from "../modules/bankAccount/domain/bankAccountId.js";
import { createUUID } from "../utils/createUUID.js";
import { UserId } from "../modules/user/domain/userId.js";
import {
  Transaction,
  TransactionType,
} from "../modules/transactions/domain/transaction.js";
import { TransactionId } from "../modules/transactions/domain/transactionId.js";

describe("Entities", () => {
  it("should create a BankAccount", () => {
    const acc = new BankAccount(
      new BankAccountId(createUUID()),
      new UserId("abc"),
      "Main"
    );
    expect(acc.name).toBe("Main");
  });

  it("should create a Transaction", () => {
    const tx = new Transaction(
      new TransactionId(createUUID()),
      new BankAccountId(createUUID()),
      "Test",
      "category",
      TransactionType.INCOME,
      100,
      new Date()
    );

    expect(tx.amount).toBe(100);
  });
});
