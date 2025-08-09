import { BankAccountRepository } from "../domain/bankAccountRepository.js";
import { BankAccount } from "../domain/bankAccount.js";
import { BankAccountId } from "../domain/bankAccountId.js";
import { UserId } from "../../user/domain/userId.js";

export class InMemoryBankAccountRepository implements BankAccountRepository {
  private accounts: BankAccount[] = [];

  async save(account: BankAccount): Promise<void> {
    this.accounts.push(account);
  }

  async findById(id: BankAccountId): Promise<BankAccount | null> {
    return this.accounts.find((account) => account.id.equals(id)) || null;
  }

  async findByUserId(userId: UserId): Promise<BankAccount[]> {
    return this.accounts.filter((account) => account.userId.equals(userId));
  }
}
