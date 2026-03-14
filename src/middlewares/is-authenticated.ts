import type { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import logger from "#lib/logger.js";

export const isAuthenticated = (
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
