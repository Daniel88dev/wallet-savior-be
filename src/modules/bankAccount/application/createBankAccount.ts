import { BankAccountRepository } from "../domain/bankAccountRepository.js";
import { BankAccount } from "../domain/bankAccount.js";
import { BankAccountId } from "../domain/bankAccountId.js";
import { v4 as uuid4 } from "uuid";
import { UserId } from "../../user/domain/userId.js";

export class CreateBankAccount {
  private readonly bankAccountRepo: BankAccountRepository;

  constructor(bankAccountRepo: BankAccountRepository) {
    this.bankAccountRepo = bankAccountRepo;
  }

  async execute(userId: string, name: string) {
    const account = new BankAccount(
      new BankAccountId(uuid4()),
      new UserId(userId),
      name
    );
    await this.bankAccountRepo.save(account);
    return account;
  }
}
