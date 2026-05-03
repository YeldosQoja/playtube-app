import type { Request as ExpressRequest } from "express";

declare global {
  namespace e {
    interface Request {
      user?: User;
      validatedQuery: { [key: string]: string };
    }
  }
}

export interface AuthenticatedRequest extends ExpressRequest {
  user: User;
}
