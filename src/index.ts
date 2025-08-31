import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import { swaggerDocs } from "./utils/swagger.js";
import { createServer } from "./server.js";

const server = createServer();

server.listen(config.api.port, () => {
  if (config.api.env === "dev") swaggerDocs(server, config.api.port);
  logger.info(`Server is running on port ${config.api.port}`);
});
