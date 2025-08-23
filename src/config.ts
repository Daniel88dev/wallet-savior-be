import dotenv from "dotenv";
dotenv.config({ quiet: true });

type Config = {
  api: APIConfig;
  db: DBConfig;
  authConf?: AuthConfig;
};

type APIConfig = { port: number; env: "production" | "dev" | "test" };

type DBConfig = { database: string };

type AuthConfig = { secret: string; url: string };

function envOrThrow(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

const environment = envOrThrow("NODE_ENV") as "production" | "dev" | "test";

export const config: Config = {
  api: {
    port: parseInt(envOrThrow("PORT")),
    env: environment,
  },
  db: {
    database: envOrThrow("DATABASE"),
  },
  authConf:
    environment !== "test"
      ? {
          secret: envOrThrow("BETTER_AUTH_SECRET"),
          url: envOrThrow("BETTER_AUTH_URL"),
        }
      : undefined,
};
