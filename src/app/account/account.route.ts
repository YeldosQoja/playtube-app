import express from "express";
import { validate } from "#middlewares/validate.js";
import { createAccount, getProfile } from "./account.controller.js";
import { createAccountSchema } from "#validators/account/create-account.schema.js";
import { profileSchema } from "#validators/account/get-profile.schema.js";

const router = express.Router();

router.post("/create", validate(createAccountSchema), createAccount);
router.get("/profile", validate(profileSchema), getProfile);

export default router;
