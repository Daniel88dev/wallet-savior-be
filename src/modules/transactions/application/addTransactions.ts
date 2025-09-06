import { TransactionRepository } from "../domain/transactionRepository.js";
import { TransactionType } from "../infrastructure/transactionSchema.js";
import { Transaction } from "../domain/transaction.js";
import { BankAccountId } from "../../bankAccount/domain/bankAccountId.js";
import { TransactionId } from "../domain/transactionId.js";
import { v4 as uuidv4 } from "uuid";

export class AddTransactions {
  private readonly transactionRepo: TransactionRepository;

  constructor(transactionRepo: TransactionRepository) {
    this.transactionRepo = transactionRepo;
  }

  async execute(
    records: {
      bankAccountId: string;
      name: string;
      category: string;
      amount: number;
      type: TransactionType;
      date: Date;
    }[]
  ): Promise<Transaction[]> {
    const transactions = records.map(
      (record) =>
        new Transaction(
          new TransactionId(uuidv4()),
          new BankAccountId(record.bankAccountId),
          record.name,
          record.category,
          record.type,
          record.amount,
          record.date
        )
    );

    await this.transactionRepo.saveAll(transactions);
    return transactions;
  }
}
