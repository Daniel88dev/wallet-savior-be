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
  switch (err.message) {
    case "notFound":
      res.status(404).json({ message: "Searched resource not found" });
      break;
    case "notAuthenticated":
      res.status(401).json({ message: "Not authenticated" });
      break;
    case "noAccess":
      res
        .status(403)
        .json({ message: "You do not have access to this resource" });
      break;
    case "validator":
      res.status(400).json({ message: "Invalid input", error: err.cause });
      break;
    default:
      res.status(500).json({ message: "Internal server error" });
  }
};
