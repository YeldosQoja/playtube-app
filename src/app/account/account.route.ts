import express from "express";
import { validate } from "#middlewares/validate.js";
import { profileSchema } from "#validators/account/get-profile.schema.js";
import { AccountController } from "./account.controller.js";

export function createAccountRouter(accountController: AccountController) {
  const router = express.Router();

  router.get(
    "/profile",
    validate(profileSchema),
    accountController.getProfile,
  );

  return router;
}
