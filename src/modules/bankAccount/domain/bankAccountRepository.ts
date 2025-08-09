import { BankAccount } from "./bankAccount.js";
import { BankAccountId } from "./bankAccountId.js";
import { UserId } from "../../user/domain/userId.js";

export interface BankAccountRepository {
  save(account: BankAccount): Promise<void>;
  findById(id: BankAccountId): Promise<BankAccount | null>;
  findByUserId(userId: UserId): Promise<BankAccount[]>;
}
