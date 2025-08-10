import { describe, it, expect } from "vitest";
import { InMemoryBankAccountRepository } from "../modules/bankAccount/infrastructure/inMemoryBankAccountRepository.js";
import { CreateBankAccount } from "../modules/bankAccount/application/createBankAccount.js";
import { createUUID } from "../utils/createUUID.js";
import { AddTransaction } from "../modules/transactions/application/addTransaction.js";
import { CalculateMonthlySavings } from "../modules/transactions/application/calculateMonthlySavings.js";
import { InMemoryTransactionRepository } from "../modules/transactions/infrastructure/inMemoryTransactionRepository.js";
import { TransactionType } from "../modules/transactions/infrastructure/transactionSchema.js";

describe("Use Cases", async () => {
  it("should create a bank account", async () => {
    const repo = new InMemoryBankAccountRepository();
    const createAcc = new CreateBankAccount(repo);
    const acc = await createAcc.execute(createUUID(), "Savings");
    expect(acc.name).toBe("Savings");
  });

  it("should add transaction and calculate savings", async () => {
    const repo = new InMemoryTransactionRepository();
    const addTx = new AddTransaction(repo);
    const calc = new CalculateMonthlySavings(repo);

    const bankId = createUUID();

    await addTx.execute(
      bankId,
      "name1",
      "cat1",
      1000,
      TransactionType.INCOME,
      new Date(2025, 0, 5)
    );

    await addTx.execute(
      bankId,
      "name2",
      "cat2",
      400,
      TransactionType.EXPENSE,
      new Date(2025, 0, 10)
    );

    const savings = await calc.execute(bankId, 2025, 0);
    expect(savings).toBe(600);
  });
});
