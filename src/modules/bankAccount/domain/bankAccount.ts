import { UserId } from "../../user/domain/userId.js";
import { BankAccountId } from "./bankAccountId.js";
import { z } from "zod";

const BankAccountNameSchema = z.string().trim().min(1);

export class BankAccount {
  public readonly id: BankAccountId;
  public readonly userId: UserId;
  public name: string;
  constructor(id: BankAccountId, userId: UserId, name: string) {
    this.id = id;
    this.userId = userId;
    this.name = BankAccountNameSchema.parse(name);
  }
}
