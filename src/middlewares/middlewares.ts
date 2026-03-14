import type { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import AppError from "#utils/AppError.js";
import { errorHandler } from "#middlewares/handle-error.js";
import logger from "#lib/logger.js";

export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  logger.error("Unauthorized.");
  res.status(HttpStatusCode.UNAUTHORIZED).json({ msg: "Unauthorized" });
};

export const handleError = async (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    await errorHandler.handle(err, res);
    return;
  }

  logger.error(err, "DB or external services failed.");

  res
    .status(HttpStatusCode.SERVER_ERROR)
    .send({ error: "Something went wrong!" });
};
