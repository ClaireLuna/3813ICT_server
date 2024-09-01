import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import HttpError from "../errors/HttpError";

export default function isUserInRole(role: Role | Role[]) {
  return (req: Request, _: Response, next: NextFunction) => {
    if (!Array.isArray(role) && req.user?.role === role) {
      next();
    } else if (Array.isArray(role) && role.some((r) => r === req.user?.role)) {
      next();
    } else {
      next(new HttpError(403, "Unauthorised"));
    }
  };
}
