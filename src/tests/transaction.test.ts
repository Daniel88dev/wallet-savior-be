/**
 * Transaction unit tests
 *
 * Testing framework note:
 * - These tests are written using Vitest/Jest-style APIs: describe/it/expect.
 * - If your project uses Vitest, ensure the test runner is configured (vite/vitest config).
 * - If your project uses Jest, the syntax is compatible; only minor config differences may apply.
 *
 * Coverage focus:
 * - Constructor validation via Zod schemas for name, category, type, amount, date.
 * - Date preprocessing behavior (string/number/date/invalid inputs).
 * - Mutation behavior of changeName (note: it does not re-validate).
 * - Ensures value objects (TransactionId, BankAccountId) can be passed as-is.
 *
 * External dependencies: Mock or minimal stand-ins for TransactionId/BankAccountId/TransactionType if necessary.
 */

import { describe, it, expect } from "vitest";

// Attempt to import the transaction entity and related types from likely locations.
// Adjust these imports if your repo structure differs. The following mirrors the code under test:
import { z } from "zod";

// We try to import from domain-like paths based on the provided snippet structure.
// Fallback simple stand-ins are provided below if actual imports fail at runtime.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { TransactionId } from "../transaction/domain/transactionId.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BankAccountId } from "../../bankAccount/domain/bankAccountId.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { TransactionType } from "../transaction/infrastructure/transactionSchema.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Transaction, TransactionNameSchema, TransactionCategorySchema, TransactionAmountSchema, TransactionDateSchema, TransactionTypeSchema } from "../transaction/domain/transaction.js";

// Fallback stubs (if the above imports fail during type-check, comment these in, or keep as runtime fallback):
// Uncomment these if your project doesn't expose these modules for tests.
/*
export class TransactionId {
  constructor(public readonly value: string) {
    if (!value) throw new Error("TransactionId must be non-empty");
  }
}
export class BankAccountId {
  constructor(public readonly value: string) {
    if (!value) throw new Error("BankAccountId must be non-empty");
  }
}
export const TransactionType = ["DEBIT", "CREDIT"] as const;

export const TransactionTypeSchema = z.enum(TransactionType);
export const TransactionNameSchema = z.string().trim().min(1);
export const TransactionCategorySchema = z.string().trim().min(1);
export const TransactionAmountSchema = z.number().positive();
export const TransactionDateSchema = z.preprocess((arg) => {
  if (typeof arg === "string" || typeof arg === "number") {
    const d = new Date(arg);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return arg;
}, z.date());

export class Transaction {
  public readonly id: TransactionId;
  public readonly bankAccountId: BankAccountId;
  public name: string;
  public category: string;
  public type: (typeof TransactionType)[number];
  public amount: number;
  public date: Date;
  constructor(
    id: TransactionId,
    bankAccountId: BankAccountId,
    name: string,
    category: string,
    type: (typeof TransactionType)[number],
    amount: number,
    date: Date | string | number
  ) {
    this.id = id;
    this.bankAccountId = bankAccountId;
    this.name = TransactionNameSchema.parse(name);
    this.category = TransactionCategorySchema.parse(category);
    this.type = TransactionTypeSchema.parse(type);
    this.amount = TransactionAmountSchema.parse(amount);
    this.date = TransactionDateSchema.parse(date as any);
  }
  changeName(newName: string) {
    this.name = newName;
  }
}
*/

function makeId(value = "tx_123") {
  try {
    return new TransactionId(value);
  } catch {
    // Fallback to a simple object if the VO constructor isn't available or fails in this test env
    return { value } as unknown as TransactionId;
  }
}

function makeBankId(value = "ba_456") {
  try {
    return new BankAccountId(value);
  } catch {
    return { value } as unknown as BankAccountId;
  }
}

function pickValidType(): any {
  // TransactionTypeSchema is z.enum([...]).safeParse to pick a valid value.
  // We try common values or derive from schema options if possible.
  const candidates = ["DEBIT", "CREDIT", "INCOME", "EXPENSE", "TRANSFER"];
  for (const c of candidates) {
    if (TransactionTypeSchema.safeParse(c).success) return c;
  }
  // If schema exposes options:
  // @ts-ignore
  if (typeof (TransactionTypeSchema as any).options !== "undefined") {
    // @ts-ignore
    const opts = (TransactionTypeSchema as any).options as string[];
    if (opts?.length) return opts[0];
  }
  // If TransactionType is exported as a const tuple
  // @ts-ignore
  if (Array.isArray(TransactionType) && TransactionType.length > 0) {
    // @ts-ignore
    return TransactionType[0];
  }
  throw new Error("No valid TransactionType found for tests");
}

describe("Transaction validation schemas", () => {
  it("TransactionNameSchema trims and accepts non-empty strings", () => {
    const parsed = TransactionNameSchema.parse("  Grocery  ");
    expect(parsed).toBe("Grocery");
  });

  it("TransactionNameSchema rejects empty or whitespace-only strings", () => {
    expect(() => TransactionNameSchema.parse("")).toThrow();
    expect(() => TransactionNameSchema.parse("   ")).toThrow();
  });

  it("TransactionCategorySchema trims and accepts non-empty strings", () => {
    const parsed = TransactionCategorySchema.parse("  Food  ");
    expect(parsed).toBe("Food");
  });

  it("TransactionCategorySchema rejects empty or whitespace-only strings", () => {
    expect(() => TransactionCategorySchema.parse("")).toThrow();
    expect(() => TransactionCategorySchema.parse("   ")).toThrow();
  });

  it("TransactionAmountSchema accepts positive numbers and rejects zero/negative", () => {
    expect(TransactionAmountSchema.parse(0.01)).toBe(0.01);
    expect(() => TransactionAmountSchema.parse(0)).toThrow();
    expect(() => TransactionAmountSchema.parse(-1)).toThrow();
    expect(() => TransactionAmountSchema.parse(Number.NaN)).toThrow();
  });

  it("TransactionTypeSchema accepts only supported types", () => {
    const valid = pickValidType();
    expect(TransactionTypeSchema.parse(valid)).toBe(valid);
    expect(() => TransactionTypeSchema.parse("NOT_A_TYPE")).toThrow();
  });

  describe("TransactionDateSchema preprocess", () => {
    it("accepts Date instances", () => {
      const d = new Date("2020-01-01T00:00:00.000Z");
      const parsed = TransactionDateSchema.parse(d);
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.toISOString()).toBe(d.toISOString());
    });

    it("accepts ISO date strings and converts to Date", () => {
      const parsed = TransactionDateSchema.parse("2021-05-10T12:34:56.000Z");
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.toISOString()).toBe("2021-05-10T12:34:56.000Z");
    });

    it("accepts numeric timestamps (ms since epoch)", () => {
      const ts = Date.UTC(2022, 0, 2, 3, 4, 5); // Jan 2 2022 03:04:05 UTC
      const parsed = TransactionDateSchema.parse(ts);
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.getTime()).toBe(ts);
    });

    it("rejects invalid date strings and invalid values", () => {
      expect(() => TransactionDateSchema.parse("not-a-date")).toThrow();
      expect(() => TransactionDateSchema.parse({} as any)).toThrow();
      expect(() => TransactionDateSchema.parse(null as any)).toThrow();
      expect(() => TransactionDateSchema.parse(undefined as any)).toThrow();
    });
  });
});

describe("Transaction entity", () => {
  it("constructs successfully with valid inputs and normalizes fields", () => {
    const id = makeId("tx_1");
    const bankId = makeBankId("ba_1");
    const name = "  Rent ";
    const category = "  Housing ";
    const type = pickValidType();
    const amount = 1200.5;
    const date = "2024-01-31T00:00:00.000Z";

    const t = new Transaction(id, bankId, name, category, type, amount, date as any);

    expect(t.id).toBeDefined();
    expect(t.bankAccountId).toBeDefined();
    expect(t.name).toBe("Rent"); // trimmed
    expect(t.category).toBe("Housing"); // trimmed
    expect(t.type).toBe(type);
    expect(t.amount).toBe(amount);
    expect(t.date).toBeInstanceOf(Date);
    expect(t.date.toISOString()).toBe("2024-01-31T00:00:00.000Z");
  });

  it("throws when name is empty/whitespace", () => {
    const id = makeId();
    const bankId = makeBankId();
    const type = pickValidType();

    expect(
      () => new Transaction(id, bankId, "", "Cat", type, 10, new Date())
    ).toThrow();

    expect(
      () => new Transaction(id, bankId, "   ", "Cat", type, 10, new Date())
    ).toThrow();
  });

  it("throws when category is empty/whitespace", () => {
    const id = makeId();
    const bankId = makeBankId();
    const type = pickValidType();

    expect(
      () => new Transaction(id, bankId, "Name", "", type, 10, new Date())
    ).toThrow();

    expect(
      () => new Transaction(id, bankId, "Name", "   ", type, 10, new Date())
    ).toThrow();
  });

  it("throws when amount is not positive", () => {
    const id = makeId();
    const bankId = makeBankId();
    const type = pickValidType();

    expect(
      () => new Transaction(id, bankId, "Name", "Cat", type, 0, new Date())
    ).toThrow();

    expect(
      () => new Transaction(id, bankId, "Name", "Cat", type, -5, new Date())
    ).toThrow();
  });

  it("throws when type is invalid", () => {
    const id = makeId();
    const bankId = makeBankId();

    expect(
      () => new Transaction(id, bankId, "Name", "Cat", "INVALID_TYPE" as any, 10, new Date())
    ).toThrow();
  });

  it("throws when date is invalid", () => {
    const id = makeId();
    const bankId = makeBankId();
    const type = pickValidType();

    expect(
      () => new Transaction(id, bankId, "Name", "Cat", type, 10, "not-a-date" as any)
    ).toThrow();

    expect(
      () => new Transaction(id, bankId, "Name", "Cat", type, 10, {} as any)
    ).toThrow();
  });

  it("accepts Date and timestamp strings/numbers for date", () => {
    const id = makeId();
    const bankId = makeBankId();
    const type = pickValidType();

    const d = new Date("2023-06-01T00:00:00.000Z");
    let t = new Transaction(id, bankId, "Name", "Cat", type, 10, d);
    expect(t.date.toISOString()).toBe("2023-06-01T00:00:00.000Z");

    t = new Transaction(id, bankId, "Name", "Cat", type, 10, "2023-06-01T00:00:00.000Z" as any);
    expect(t.date.toISOString()).toBe("2023-06-01T00:00:00.000Z");

    const ts = Date.UTC(2023, 5, 1); // Jun 1, 2023 UTC
    t = new Transaction(id, bankId, "Name", "Cat", type, 10, ts as any);
    expect(t.date.getTime()).toBe(ts);
  });

  it("changeName updates the name without validation", () => {
    const id = makeId();
    const bankId = makeBankId();
    const type = pickValidType();
    const t = new Transaction(id, bankId, "Original", "Cat", type, 10, new Date());

    t.changeName("New Name");
    expect(t.name).toBe("New Name");

    // Even invalid (empty) name is allowed by changeName (no schema parse here)
    t.changeName("");
    expect(t.name).toBe("");
  });
});