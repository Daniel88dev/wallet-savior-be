import { describe, it, expect } from "vitest";
import { BankAccountId } from "../modules/bankAccount/domain/bankAccountId.js";
import { TransactionId } from "../modules/transactions/domain/transactionId.js";
import { UserId } from "../modules/user/domain/userId.js";
import { v4 as uuid } from "uuid";

describe("Value Objects", () => {
  it("should create valid UserId", () => {
    const id = new UserId("abc");
    expect(id.value).toBeDefined();
  });

  it("should throw for empty BankAccountId", () => {
    expect(() => new BankAccountId("")).toThrow();
  });

  it("should compare TransactionIds correctly", () => {
    const identification = uuid();
    const id1 = new TransactionId(identification);
    const id2 = new TransactionId(identification);
    expect(id1.equals(id2)).toBe(true);
  });
});
