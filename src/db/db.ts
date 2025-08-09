import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "../config.js";
import * as schema from "./schema.js";

export const db = drizzle({
  connection: {
    connectionString: config.db.database,
  },
  schema,
});
