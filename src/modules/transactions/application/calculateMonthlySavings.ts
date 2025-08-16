import { TransactionRepository } from "../domain/transactionRepository.js";
import { BankAccountId } from "../../bankAccount/domain/bankAccountId.js";
import { TransactionType } from "../infrastructure/transactionSchema.js";

export class CalculateMonthlySavings {
  private readonly transactionRepo: TransactionRepository;

  constructor(transactionRepo: TransactionRepository) {
    this.transactionRepo = transactionRepo;
  }

  async execute(
    bankAccountId: string,
    year: number,
    month: number
  ): Promise<number> {
    const transactions = await this.transactionRepo.findByBankAccountId(
      new BankAccountId(bankAccountId)
    );

    const monthlyTransactions = transactions.filter(
      (t) => t.date.getFullYear() === year && t.date.getMonth() === month
    );

    const income = monthlyTransactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthlyTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    return income - expenses;
  }
}
