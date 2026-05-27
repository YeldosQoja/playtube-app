import type { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import AppError from "#utils/AppError.js";
import type { LoggerService } from "#lib/logger.service.js";

class ErrorHandler {
  constructor(private readonly loggerService: LoggerService) {}

  async handle(error: AppError, res: Response) {
    this.loggerService.error(error, error.message);
    res.status(error.statusCode).send({
      error: error.message,
    });
  }
}

export const createHandleError = (loggerService: LoggerService) => {
  const errorHandler = new ErrorHandler(loggerService);

  return async (
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

    loggerService.error(err, "DB or external services failed.");

    res
      .status(HttpStatusCode.SERVER_ERROR)
      .send({ error: "Something went wrong!" });
  };
};
