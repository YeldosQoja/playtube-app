import type { RequestHandler } from "express";
import { AccountService } from "./account.service.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";

export function createAccountController(accountService: AccountService) {
  return {
    getProfile: (async (req, res) => {
      const profile = await accountService.getAccountById(req.user!.id);
      res.status(HttpStatusCode.OK).send({ profile });
    }) satisfies RequestHandler,
  };
}

export type AccountController = ReturnType<typeof createAccountController>;
