import type { Request as ExpressRequest } from "express";

declare global {
  namespace e {
    interface Request extends ExpressRequest {
      validatedQuery: { [key: string]: string };
    }
  }
}
