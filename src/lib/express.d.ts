import type { Account } from "#core/account/account.repository.js";
import "express";

declare global {
  namespace Express {
    interface User {
      id: string;
    }

    interface Request {
      user: User;
      account?: Account;
      validatedQuery?: { [key: string]: string };
    }
  }
}

export {};
