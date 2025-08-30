import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "../config.js";
import { schema } from "./schema.js";
import fs from "node:fs";
import path from "node:path";

function expandHome(filePath?: string) {
  if (!filePath) return filePath;
  if (filePath.startsWith("~")) {
    const home = process.env.HOME || process.env.USERPROFILE;
    if (!home) return filePath; // fallback: return as-is
    return path.join(home, filePath.slice(1));
  }
  return filePath;
}

export const db = drizzle({
  connection: {
    connectionString: config.db.database,
    ...(function () {
      const caPath = config.db.DB_SSL_CA_PATH;
      if (caPath && caPath.length) {
        const resolved = path.resolve(<string>expandHome(caPath));
        return {
          ssl: {
            rejectUnauthorized: true,
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            ca: fs.readFileSync(resolved).toString(),
          },
        };
      }

      if (process.env.DB_SSL_REJECT_UNAUTHORIZED === "0") {
        return { ssl: { rejectUnauthorized: false } };
      }

      return { ssl: { rejectUnauthorized: true } };
    })(),
  },
  schema,
});
