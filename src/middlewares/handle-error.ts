import type { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import AppError from "#utils/AppError.js";
import logger from "#lib/logger.js";

class ErrorHandler {
  async handle(error: AppError, res: Response) {
    logger.error(error, error.message);
    res.status(error.statusCode).send({
      error: error.message,
    });
  }
}

export const errorHandler = new ErrorHandler();

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
