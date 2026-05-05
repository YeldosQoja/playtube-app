import type { RequestHandler } from "express";
import { AccountService } from "./account.service.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";
import { CreateAccountBody } from "#validators/account/create-account.schema.js";

export function createAccountController(accountService: AccountService) {
  return {
    getProfile: (async (req, res) => {
      const account = await accountService.getAccountByUserId(req.user.id);
      res.status(HttpStatusCode.OK).send({ account });
    }) satisfies RequestHandler,
    create: (async (req, res) => {
      const { firstName, lastName, username, email } =
        req.body as CreateAccountBody;
      await accountService.createAccount(
        firstName,
        lastName,
        username,
        req.user.id,
        email,
      );
      res.status(HttpStatusCode.OK).send({ msg: "Account created" });
    }) satisfies RequestHandler,
  };
}

export type AccountController = ReturnType<typeof createAccountController>;
