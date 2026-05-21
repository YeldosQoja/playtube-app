import type { NextFunction, Request, Response } from "express";
import * as jose from "jose";
import { errors } from "jose";
import logger from "#lib/logger.js";
import { HttpStatusCode } from "#utils/HttpStatusCode.js";

const JWT_PUBLIC_KEY = process.env["JWT_PUBLIC_KEY"];

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { authorization } = req.headers;
  if (!authorization) {
    logger.error("Unauthorized.");
    res.status(HttpStatusCode.UNAUTHORIZED).send({ msg: "Unauthorized" });
    return;
  }

  const [scheme, token] = authorization.split(" ") || [];
  if (!token) {
    logger.error({ scheme }, "Unauthorized.");
    res.status(HttpStatusCode.UNAUTHORIZED).send({ msg: "Unauthorized" });
    return;
  }

  try {
    const publicKey = await jose.importSPKI(JWT_PUBLIC_KEY as string, "RS256");
    const {
      payload: { sub },
    } = await jose.jwtVerify(token, publicKey);

    if (!sub) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .send({ msg: "Unauthorized" });
    }

    req.user = { id: sub };
    return next();
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .send({ msg: "Token expired" });
    }
    if (err instanceof errors.JWTInvalid) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .send({ msg: "Invalid token" });
    }
    if (err instanceof errors.JWSSignatureVerificationFailed) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .send({ msg: "Invalid signature" });
    }

    throw err;
  }
};
