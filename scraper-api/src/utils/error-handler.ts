import type { NextFunction, Request, Response } from "express";
import { AppError } from "./app-error.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError("NOT_FOUND", 404, `Route ${req.method} ${req.path} not found`));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.code,
      message: error.message
    });
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  return res.status(500).json({
    success: false,
    error: "UNKNOWN_ERROR",
    message
  });
}
