import { Transaction } from "./transaction.js";
import { TransactionId } from "./transactionId.js";
import { BankAccountId } from "../../bankAccount/domain/bankAccountId.js";

export interface TransactionRepository {
  save(transaction: Transaction): Promise<void>;
  findById(id: TransactionId): Promise<Transaction | null>;
  findByBankAccountId(bankAccountId: BankAccountId): Promise<Transaction[]>;
  update(transaction: Transaction): Promise<Transaction>;
}
