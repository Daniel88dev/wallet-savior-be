import express from "express";
import { serverCors } from "./middleware/cors.js";
import { helmetHeaders } from "./middleware/headers.js";
import { limiter } from "./middleware/limiter.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";
import bankAccountRoutes from "./modules/bankAccount/interfaces/bankAccountRoutes.js";
import { config } from "./config.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import transactionRoutes from "./modules/transactions/interfaces/transactionRoutes.js";

export const createServer = () => {
  const app = express();
  app
    .use(serverCors)
    .use(helmetHeaders)
    .use(limiter)
    .all("/api/auth/{*any}", toNodeHandler(auth))
    .use(express.json());

  app.use("/api/accounts", bankAccountRoutes);
  app.use("/api/transactions", transactionRoutes);

  app.get("/health", (_, res) => {
    res.status(200).json({ ok: true, environment: config.api.env });
  });

  app.use(errorMiddleware);

  return app;
};
