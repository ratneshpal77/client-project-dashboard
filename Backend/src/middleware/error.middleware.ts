import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req,
  res,
  _next,
) => {
  console.error(err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        statusCode: 400,
        details: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });

    return;
  }

  const error = err as AppError;

  const statusCode =
    typeof error.statusCode === "number"
      ? error.statusCode
      : 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message:
        statusCode === 500
          ? "Internal server error"
          : error.message || "Request failed",
      statusCode,
    },
  });
};