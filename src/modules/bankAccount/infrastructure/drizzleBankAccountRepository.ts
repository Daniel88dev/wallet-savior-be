import { BankAccountRepository } from "../domain/bankAccountRepository.js";
import { db } from "../../../db/db.js";
import { bankAccounts } from "./bankAccountSchema.js";
import { BankAccount } from "../domain/bankAccount.js";
import { BankAccountId } from "../domain/bankAccountId.js";
import { eq } from "drizzle-orm";
import { UserId } from "../../user/domain/userId.js";

export class DrizzleBankAccountRepository implements BankAccountRepository {
  async save(account: BankAccount): Promise<void> {
    await db.insert(bankAccounts).values({
      id: account.id.value,
      userId: account.userId.value,
      name: account.name,
    });
  }

  async findById(id: BankAccountId): Promise<BankAccount | null> {
    const result = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.id, id.value));
    if (!result[0]) return null;
    return new BankAccount(
      new BankAccountId(result[0].id),
      new UserId(result[0].userId),
      result[0].name
    );
  }

  async findByUserId(userId: UserId): Promise<BankAccount[]> {
    const rows = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.userId, userId.value));
    return rows.map(
      (r) =>
        new BankAccount(new BankAccountId(r.id), new UserId(r.userId), r.name)
    );
  }
}
