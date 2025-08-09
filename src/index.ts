import express from "express";
import { config } from "./config.js";
import { serverCors } from "./middleware/cors.js";
import { helmetHeaders } from "./middleware/headers.js";
import { limiter } from "./middleware/limiter.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";
import { logger } from "./middleware/logger.js";

const app = express();

//middleware
app.use(serverCors);
app.use(helmetHeaders);
app.use(limiter);
app.all("/auth/{*any}", toNodeHandler(auth));
app.use(express.json());

//routes

app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok" });
});
//error handling middleware
app.use(errorMiddleware);

app.listen(config.api.port, () => {
  logger.info(`Server is running on port ${config.api.port}`);
});
