import { defineConfig } from "drizzle-kit";
// @ts-ignore
import { config } from "./src/config";
import path from "path";
import { homedir } from "os";

function expandHome(p?: string): string | undefined {
  if (!p) return p;
  if (p === "~") return homedir();
  if (p.startsWith("~/") || p.startsWith("~\\")) {
    return path.join(homedir(), p.slice(2));
  }
  return p;
}

const baseDbUrl = config.db.database;
const caPath = expandHome(config.db.DB_SSL_CA_PATH);
const dbUrl =
  caPath && caPath.length
    ? `${baseDbUrl}${
        baseDbUrl.includes("?") ? "&" : "?"
      }sslmode=verify-full&sslrootcert=${encodeURIComponent(
        path.resolve(caPath)
      )}`
    : baseDbUrl;

export default defineConfig({
  schema: [
    "src/db/userSchema.ts",
    "src/modules/bankAccount/infrastructure/bankAccountSchema.ts",
    "src/modules/transactions/infrastructure/transactionSchema.ts",
  ],
  out: "src/db/out",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
