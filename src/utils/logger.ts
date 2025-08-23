import { createLogger, format, transports } from "winston";
import path from "node:path";
import fs from "node:fs";

// Ensure the logs directory exists
const LOG_DIR = process.env.LOG_DIR || path.resolve(process.cwd(), "logs");
let fileTransports: InstanceType<typeof transports.File>[] = [];

try {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fileTransports = [
    new transports.File({ filename: path.join(LOG_DIR, "combined.log") }),
    new transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
    }),
  ];
} catch (error) {
  console.error("Error creating logs directory:", error);
}

export const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: {
    service: "Wallet Savior",
    buildInfo: {
      version: "0.1.0",
      nodeVersion: process.version,
    },
  },
  transports: [new transports.Console(), ...fileTransports],
});
