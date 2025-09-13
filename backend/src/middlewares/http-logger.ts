import pinoHttp from "pino-http";
import { logger } from "../lib/logger";
import { randomUUID } from "crypto";

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => (req.headers["x-request-id"] as string) || randomUUID(),
  autoLogging: true,
  customProps: (req, res) => ({
    reqId: (req as any).id,
  }),
});
