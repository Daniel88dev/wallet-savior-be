import { TransactionRepository } from "../domain/transactionRepository.js";
import { Transaction } from "../domain/transaction.js";
import { TransactionId } from "../domain/transactionId.js";
import { BankAccountId } from "../../bankAccount/domain/bankAccountId.js";

export class InMemoryTransactionRepository implements TransactionRepository {
  private transactions: Transaction[] = [];

  async save(transaction: Transaction): Promise<void> {
    this.transactions.push(transaction);
  }

  async findById(id: TransactionId): Promise<Transaction | null> {
    return this.transactions.find((t) => t.id.equals(id)) || null;
  }

  async findByBankAccountId(
    bankAccountId: BankAccountId
  ): Promise<Transaction[]> {
    return this.transactions.filter((t) =>
      t.bankAccountId.equals(bankAccountId)
    );
  }
}
