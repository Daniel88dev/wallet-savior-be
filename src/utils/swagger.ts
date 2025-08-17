import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express, Request, Response } from "express";
import { logger } from "./logger.js";
import fs from "node:fs";
import yaml from "js-yaml";
import path from "node:path";
import swaggerJSDoc from "swagger-jsdoc";

const swaggerFilePath = path.join(process.cwd(), "swagger.yaml");
const swaggerFileContent = fs.readFileSync(swaggerFilePath, "utf8");
const swaggerDefinition = yaml.load(
  swaggerFileContent
) as swaggerJSDoc.SwaggerDefinition;

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app: Express, port: number) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/docs.json", (_req: Request, res: Response) => {
    res.set("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  logger.info(
    `Swagger documentation available at http://localhost:${port}/docs`
  );
};
