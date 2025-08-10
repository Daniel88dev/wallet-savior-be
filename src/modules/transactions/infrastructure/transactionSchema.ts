import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { singlestoreEnum } from "drizzle-orm/singlestore-core";
import { TransactionType } from "../domain/transaction.js";

const TransactionTypeValues = Object.values(TransactionType) as [
  TransactionType,
  ...TransactionType[]
];

const transactionType = pgEnum("transaction_type", TransactionTypeValues);

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey(),
  bankAccountId: uuid("bank_account_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  amount: numeric("amount").notNull(),
  type: transactionType("type").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
