import { z } from "zod";

const TransactionIdSchema = z.uuid();

export class TransactionId {
  public readonly value: string;

  constructor(value: string) {
    this.value = TransactionIdSchema.parse(value);
  }

  equals(other: TransactionId): boolean {
    return this.value === other.value;
  }
}
