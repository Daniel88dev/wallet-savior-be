import { z } from "zod";

const BankAccountIdSchema = z.uuid("Invalid BankAccountId format");

export class BankAccountId {
  public readonly value: string;

  constructor(value: string) {
    this.value = BankAccountIdSchema.parse(value);
  }

  equals(other: BankAccountId): boolean {
    return this.value === other.value;
  }
}
