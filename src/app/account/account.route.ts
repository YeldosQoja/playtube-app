import express from "express";
import { validate } from "#middlewares/validate.js";
import { getProfile } from "./account.controller.js";
import { profileSchema } from "#validators/account/get-profile.schema.js";

const router = express.Router();

router.get("/profile", validate(profileSchema), getProfile);

export default router;
