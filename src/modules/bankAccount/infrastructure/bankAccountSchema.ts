import { numeric, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

export enum CurrencyType {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  AUD = "AUD",
  CAD = "CAD",
  CHF = "CHF",
  JPY = "JPY",
  NZD = "NZD",
  SGD = "SGD",
  ZAR = "ZAR",
  KRW = "KRW",
  HKD = "HKD",
  CZK = "CZK",
}

export function enumToPgEnum<T extends Record<string, string>>(
  myEnum: T
): [T[keyof T], ...T[keyof T][]] {
  const values = Object.values(myEnum) as T[keyof T][];
  const [first, ...rest] = values;
  if (!first) {
    throw new Error("Enum must have at least one value");
  }
  return [first, ...rest];
}

export const currencyEnum = pgEnum("currency", enumToPgEnum(CurrencyType));

export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  overdraft: numeric("overdraft", { mode: "number" }).notNull(),
  currency: currencyEnum("currency").notNull(),
  balance: numeric("balance", { mode: "number" }).notNull(),
});
