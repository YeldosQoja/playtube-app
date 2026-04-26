import { RequestHandler } from "express";
import passport from "passport";

export const authenticate: RequestHandler = passport.authenticate("local");
