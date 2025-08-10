import { describe, expect, it } from "vitest";
import { InMemoryTransactionRepository } from "../modules/transactions/infrastructure/inMemoryTransactionRepository.js";
import { AddTransaction } from "../modules/transactions/application/addTransaction.js";
import { CalculateMonthlySavings } from "../modules/transactions/application/calculateMonthlySavings.js";
import { createUUID } from "../utils/createUUID.js";
import { TransactionType } from "../modules/transactions/infrastructure/transactionSchema.js";

describe("CalculateMonthlySavings", () => {
  it("should calculate correct savings", async () => {
    const repo = new InMemoryTransactionRepository();
    const addTransaction = new AddTransaction(repo);
    const calcSavings = new CalculateMonthlySavings(repo);

    const bankId = createUUID();

    await addTransaction.execute(
      bankId,
      "name1",
      "cat1",
      1000,
      TransactionType.INCOME,
      new Date(2025, 0, 5)
    );

    await addTransaction.execute(
      bankId,
      "name2",
      "cat2",
      400,
      TransactionType.EXPENSE,
      new Date(2025, 0, 10)
    );

    const savings = await calcSavings.execute(bankId, 2025, 0);
    expect(savings).toBe(600);
  });
});
