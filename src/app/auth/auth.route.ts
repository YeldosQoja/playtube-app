import express from "express";
import { validate } from "#middlewares/validate.js";
import { signInSchema } from "#validators/auth/sign-in.schema.js";
import { signUpSchema } from "#validators/auth/sign-up.schema.js";
import { signIn, signUp } from "./auth.controller.js";

const router = express.Router();

router.post("/signin", validate(signInSchema), signIn);
router.post("/signup", validate(signUpSchema), signUp);

export default router;
