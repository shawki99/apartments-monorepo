import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../errors/ApiError";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    const details = err.flatten();
    (req as any).log?.warn({ err: details }, "validation failed");
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid request", details },
    });
  }

  if (err instanceof ApiError) {
    (req as any).log?.warn({ err }, "api error");
    return res
      .status(err.status)
      .json({
        error: { code: err.code, message: err.message, details: err.details },
      });
  }

  (req as any).log?.error({ err }, "unhandled error");
  return res.status(500).json({
    error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" },
  });
}
