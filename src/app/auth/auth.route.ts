import express from "express";
import { validate } from "#middlewares/validate.js";
import { isAuthenticated } from "#middlewares/is-authenticated.js";
import { signInSchema } from "#validators/auth/sign-in.schema.js";
import { signUpSchema } from "#validators/auth/sign-up.schema.js";
import { meSchema } from "#validators/auth/me.schema.js";
import { signIn, signUp, getMe } from "./auth.controller.js";
import { configurePassport } from "./auth.service.js";

const router = express.Router();

configurePassport();

router.post("/signin", validate(signInSchema), signIn);
router.post("/signup", validate(signUpSchema), signUp);
router.get("/me", isAuthenticated, validate(meSchema), getMe);

export default router;
