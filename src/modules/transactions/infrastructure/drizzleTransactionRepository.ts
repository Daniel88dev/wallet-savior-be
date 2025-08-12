import { TransactionRepository } from "../domain/transactionRepository.js";
import { db } from "../../../db/db.js";
import { transactions } from "./transactionSchema.js";
import { TransactionId } from "../domain/transactionId.js";
import { Transaction } from "../domain/transaction.js";
import { eq } from "drizzle-orm";
import { BankAccountId } from "../../bankAccount/domain/bankAccountId.js";

export class DrizzleTransactionRepository implements TransactionRepository {
  async save(transaction: any): Promise<void> {
    await db.insert(transactions).values({
      id: transaction.id,
      bankAccountId: transaction.bankAccountId,
      name: transaction.name,
      category: transaction.category,
      type: transaction.type,
      amount: transaction.amount,
      date: transaction.date,
    });
  }

  async findById(id: TransactionId): Promise<Transaction | null> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id.value));
    if (!result[0]) return null;
    return new Transaction(
      new TransactionId(result[0].id),
      new BankAccountId(result[0].bankAccountId),
      result[0].name,
      result[0].category,
      result[0].type,
      Number(result[0].amount),
      new Date(result[0].date)
    );
  }

  async findByBankAccountId(
    bankAccountId: BankAccountId
  ): Promise<Transaction[]> {
    const rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.bankAccountId, bankAccountId.value));
    return rows.map(
      (r) =>
        new Transaction(
          new TransactionId(r.id),
          new BankAccountId(r.bankAccountId),
          r.name,
          r.category,
          r.type,
          Number(r.amount),
          new Date(r.date)
        )
    );
  }
}
