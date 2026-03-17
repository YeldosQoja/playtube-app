import { Request, Response, NextFunction } from "express";
import z, { ZodObject, ZodOptional, ZodType } from "zod";
import AppError from "#utils/AppError.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import logger from "#lib/logger.js";

type RequestSchema = ZodObject<{
  body: ZodObject<{ [key: string]: ZodType }> | ZodOptional;
  params: ZodObject<{ [key: string]: ZodType }> | ZodOptional;
  query: ZodObject<{ [key: string]: ZodType }> | ZodOptional;
}>;

type ParsedQs = Request["query"];
type Params = Request["params"];

export function validate(schema: RequestSchema) {
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
