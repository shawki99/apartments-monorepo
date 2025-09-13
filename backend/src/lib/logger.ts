import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: !isProd
    ? {
        target: "pino-pretty",
        options: { singleLine: true, colorize: true },
      }
    : undefined,
});
