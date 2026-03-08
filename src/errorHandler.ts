import type { Response } from "express";
import AppError from "./utils/AppError.js";
import logger from "./logger.js";

class ErrorHandler {
  async handle(error: AppError, res: Response) {
    logger.error(error, error.message);
    res.status(error.statusCode).send({
      error: error.message,
    });
  }
}

export const errorHandler = new ErrorHandler();
