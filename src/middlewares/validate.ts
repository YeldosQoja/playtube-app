import { Request, Response, NextFunction } from "express";
import z, { ZodObject, ZodType } from "zod";
import AppError from "#utils/AppError.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import logger from "#lib/logger.js";

type AnyRequestSchema = ZodObject<{
  body: ZodObject<{ [key: string]: ZodType }>;
  params: ZodObject<{ [key: string]: ZodType }>;
  query: ZodObject<{ [key: string]: ZodType }>;
}>;

type ParsedQs = Request["query"];
type Params = Request["params"];

export function validate(schema: AnyRequestSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query, body, params } = req;

      logger.info({ query, body, params }, "Request data: ");

      const result = await schema.parseAsync({
        query,
        body,
        params,
      });

      req.query = result.query as ParsedQs;
      req.body = result.body;
      req.params = result.params as Params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error(z.treeifyError(error), "Validation failed.");
        throw new AppError(
          `Incorrect request data.`,
          HttpStatusCode.BAD_REQUEST,
          false,
        );
      }

      next(error);
    }
  };
}
