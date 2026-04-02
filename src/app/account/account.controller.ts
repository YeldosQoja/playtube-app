import { RequestHandler } from "express";
import { AccountService } from "./account.service.js";
import { repository } from "#lib/data/account.repository.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";

const accountService = new AccountService(repository);

export const createAccount: RequestHandler = async (req, res) => {
  const { firstName, lastName, username, email } = req.body;
  const account = await accountService.createAccount(
    firstName,
    lastName,
    username,
    email,
  );
  res
    .status(HttpStatusCode.OK)
    .send({ account, msg: "Account created successfully." });
};

export const getProfile: RequestHandler = async (req, res) => {
  const profile = await accountService.getAccountById(req.user!.id);
  res.status(HttpStatusCode.OK).send({ profile });
};
