import { TransactionRepository } from "../domain/transactionRepository.js";
import { db } from "../../../db/db.js";
import { transactions } from "./transactionSchema.js";
import { TransactionId } from "../domain/transactionId.js";
import { Transaction } from "../domain/transaction.js";
import { asc, desc, eq } from "drizzle-orm";
import { BankAccountId } from "../../bankAccount/domain/bankAccountId.js";

export class DrizzleTransactionRepository implements TransactionRepository {
  async save(transaction: Transaction): Promise<void> {
    await db.insert(transactions).values({
      id: transaction.id.value,
      bankAccountId: transaction.bankAccountId.value,
      name: transaction.name,
      category: transaction.category,
      type: transaction.type,
      amount: String(transaction.amount),
      date: transaction.date.toISOString(),
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
      .where(eq(transactions.bankAccountId, bankAccountId.value))
      .orderBy(desc(transactions.date), asc(transactions.id))
      .limit(100);
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

  async update(transaction: Transaction): Promise<Transaction> {
    const result = await db
      .update(transactions)
      .set({
        name: transaction.name,
        category: transaction.category,
        type: transaction.type,
        amount: String(transaction.amount),
        date: transaction.date.toISOString(),
      })
      .where(eq(transactions.id, transaction.id.value))
      .returning();

    if (!result[0]) throw new Error("notFound");

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
}
