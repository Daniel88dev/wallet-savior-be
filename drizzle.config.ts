import { defineConfig } from "drizzle-kit";
import { config } from "./src/config";

export default defineConfig({
  schema: [
    "src/db/userSchema.ts",
    "src/modules/bankAccount/infrastructure/bankAccountSchema.ts",
    "src/modules/transactions/infrastructure/transactionSchema.ts",
  ],
  out: "src/db/out",
  dialect: "postgresql",
  dbCredentials: {
    url: config.db.database,
  },
});
