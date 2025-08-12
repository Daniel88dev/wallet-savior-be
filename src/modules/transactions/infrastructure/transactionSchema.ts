import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  index,
} from "drizzle-orm/pg-core";

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export function enumToPgEnum<T extends Record<string, any>>(
  myEnum: T
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as any;
}

export const transactionEnum = pgEnum("type", enumToPgEnum(TransactionType));

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey(),
    bankAccountId: uuid("bank_account_id").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    amount: numeric("amount").notNull(),
    type: transactionEnum("type").notNull(),
    date: date("date").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("bank_account_idx").on(table.bankAccountId),
    index("date_idx").on(table.date),
  ]
);
