import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "../config.js";
import * as usersSchema from "./userSchema.js";
import * as transactionSchema from "../modules/transactions/infrastructure/transactionSchema.js";
import * as bankAccountSchema from "../modules/bankAccount/infrastructure/bankAccountSchema.js";

export const db = drizzle({
  connection: {
    connectionString: config.db.database,
  },
  schema: { usersSchema, transactionSchema, bankAccountSchema },
});
