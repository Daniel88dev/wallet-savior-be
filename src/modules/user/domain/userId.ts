import { z } from "zod";

const UserIdSchema = z.string().trim();

export class UserId {
  public readonly value: string;

  constructor(value: string) {
    this.value = UserIdSchema.parse(value);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
