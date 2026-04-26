import express from "express";
import { validate } from "#middlewares/validate.js";
import { signInSchema } from "#validators/auth/sign-in.schema.js";
import { signUpSchema } from "#validators/auth/sign-up.schema.js";
import { AuthController } from "./auth.controller.js";
import passport from "passport";

export function createAuthRouter(authController: AuthController) {
  const router = express.Router();

  router.post(
    "/signin",
    validate(signInSchema),
    passport.authenticate("local"),
    authController.signIn,
  );
  router.post("/signup", validate(signUpSchema), authController.signUp);

  return router;
}
