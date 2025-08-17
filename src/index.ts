import express from "express";
import { config } from "./config.js";
import { serverCors } from "./middleware/cors.js";
import { helmetHeaders } from "./middleware/headers.js";
import { limiter } from "./middleware/limiter.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";
import { logger } from "./middleware/logger.js";
import bankAccountRoutes from "./modules/bankAccount/interfaces/bankAccountRoutes.js";
import transactionRoutes from "./modules/transactions/interfaces/transactionRoutes.js";
import { swaggerDocs } from "./middleware/swagger.js";
import * as util from "node:util";

const app = express();

//middleware
app.use(serverCors);
app.use(helmetHeaders);
app.use(limiter);
app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use(express.json());

//routes
app.use("/api/accounts", bankAccountRoutes);
app.use("/api/transactions", transactionRoutes);

const openAPISchema = await auth.api.generateOpenAPISchema();
console.log(util.inspect(openAPISchema, { depth: null, colors: true }));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns basic server health status
 *     responses:
 *       '200':
 *         description: Server is running
 */
app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok" });
});
//error handling middleware
app.use(errorMiddleware);

app.listen(config.api.port, () => {
  if (config.api.env === "dev") swaggerDocs(app, config.api.port);
  logger.info(`Server is running on port ${config.api.port}`);
});
