import express from "express";
import { validate } from "#middlewares/validate.js";
import { profileSchema } from "#validators/account/get-profile.schema.js";
import { AccountController } from "./account.controller.js";
import { createAccountSchema } from "#validators/account/create-account.schema.js";

export function createAccountRouter(accountController: AccountController) {
  const router = express.Router();

  router.get("/profile", validate(profileSchema), accountController.getProfile);

  router.post(
    "/create",
    validate(createAccountSchema),
    accountController.create,
  );

  return router;
}
