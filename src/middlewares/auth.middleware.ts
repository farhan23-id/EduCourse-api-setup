import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../generated/prisma/client";
import { env } from "../config/env";
import { HttpError } from "./error.middleware";

export const verifyToken = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    throw new HttpError(401, "Autentikasi gagal: token tidak ada");

  try {
    const payload = jwt.verify(header.split(" ")[1], env.jwtSecret) as {
      id: number;
      role: Role;
    };
    req.user = { id: payload.id, role: payload.role };
  } catch {
    throw new HttpError(401, "Autentikasi gagal: token tidak valid atau kadaluarsa");
  }

  next();
};

export const authorize =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      throw new HttpError(403, "Akses ditolak");

    next();
  };
