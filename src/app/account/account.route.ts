import express from "express";
import type { RequestValidator } from "#middlewares/validate.js";
import { profileSchema } from "#validators/account/get-profile.schema.js";
import { AccountController } from "./account.controller.js";
import { createAccountSchema } from "#validators/account/create-account.schema.js";

export function createAccountRouter(
  accountController: AccountController,
  requestValidator: RequestValidator,
) {
  const router = express.Router();

  router.get(
    "/profile",
    requestValidator.validate(profileSchema),
    accountController.getProfile,
  );

  router.post(
    "/create",
    requestValidator.validate(createAccountSchema),
    accountController.create,
  );

  return router;
}
