import { Request, Response, NextFunction } from "express";
import logger from "../core/logger.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(
    `${req.method} ${req.url} - ${err.message} - Stack: ${err.stack || "N/A"}`
  );

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "development"
      ? err.message
      : "Something went wrong";

  res.status(status).json({
    success: false,
    message,
  });
};
