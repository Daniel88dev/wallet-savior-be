import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
});
