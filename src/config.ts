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
  // eslint-disable-next-line security/detect-object-injection
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

const VALID_ENVS = ["production", "dev", "test"] as const;
type NodeEnv = (typeof VALID_ENVS)[number];

function parseNodeEnv(value: string): NodeEnv {
  const v = value.toLowerCase();
  if (v === "prod") return "production"; // backward-compat
  if ((VALID_ENVS as readonly string[]).includes(v)) return v as NodeEnv;
  throw new Error(
    `Invalid NODE_ENV: "${value}". Expected one of ${VALID_ENVS.join(", ")}`
  );
}

const environment = parseNodeEnv(envOrThrow("NODE_ENV"));

export const config: Config = {
  api: {
    //port: parseInt(envOrThrow("PORT")),
    port: (() => {
      const raw = envOrThrow("PORT");
      const n = Number.parseInt(raw, 10);
      if (!Number.isFinite(n) || n <= 0)
        throw new Error(`Invalid PORT: "${raw}"`);
      return n;
    })(),
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
