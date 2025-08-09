import { v4 as uuidv4 } from "uuid";
import { TransactionRepository } from "../domain/transactionRepository.js";
import { Transaction, TransactionType } from "../domain/transaction.js";
import { TransactionId } from "../domain/transactionId.js";
import { BankAccountId } from "../../bankAccount/domain/bankAccountId.js";

export class AddTransaction {
  private readonly transactionRepo: TransactionRepository;

  constructor(transactionRepo: TransactionRepository) {
    this.transactionRepo = transactionRepo;
  }

  async execute(
    bankAccountId: string,
    name: string,
    category: string,
    amount: number,
    type: TransactionType,
    date: Date
  ): Promise<Transaction> {
    const transaction = new Transaction(
      new TransactionId(uuidv4()),
      new BankAccountId(bankAccountId),
      name,
      category,
      type,
      amount,
      date
    );
    await this.transactionRepo.save(transaction);
    return transaction;
  }
}
