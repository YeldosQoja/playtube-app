import type { Response } from "express";
import AppError from "./utils/AppError.js";

class ErrorHandler {
  async handle(error: AppError, res: Response) {
    res.status(error.statusCode).send({
      error: error.message,
    });
  }
}

export const errorHandler = new ErrorHandler();
