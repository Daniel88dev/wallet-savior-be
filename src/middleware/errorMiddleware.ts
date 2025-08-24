import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err.message, {
    error: err,
    stackTrace: err.stack,
  });

  if (err instanceof ProjectError) {
    switch (err.name) {
      case "notFound":
        res.status(404).json({ message: err.message });
        break;
      case "notAuthenticated":
        res.status(401).json({ message: err.message });
        break;
      case "noAccess":
        res.status(403).json({ message: err.message });
        break;
      case "validator":
        res.status(400).json({ message: err.message, error: err.cause });
        break;
      default:
        res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(500).json({ message: "Internal server error" });
  }
};

type ErrorName = "notFound" | "notAuthenticated" | "noAccess" | "validator";

export class ProjectError extends Error {
  name: ErrorName;
  message: string;
  cause: unknown;

  constructor({
    name,
    message,
    cause,
  }: {
    name: ErrorName;
    message: string;
    cause?: unknown;
  }) {
    super();
    this.name = name;
    this.message = message;
    this.cause = cause;
  }
}
