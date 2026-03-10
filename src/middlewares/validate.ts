import { Request, Response, NextFunction } from "express";
import z, { ZodAny } from "zod";
import AppError from "../utils/AppError.js";
import { HttpStatusCode } from "../utils/HttpStatusCode.js";

export function validate(schema: ZodAny) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query, body, params } = req;
      const result = await schema.parseAsync({
        query,
        body,
        params,
      });

      req.query = result.query;
      req.body = result.body;
      req.params = result.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError(
          "Incorrect request data.",
          HttpStatusCode.BAD_REQUEST,
          false,
        );
      }

      next(error);
    }
  };
}
