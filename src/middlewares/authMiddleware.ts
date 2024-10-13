import { NextFunction, Request, Response } from "express";
import prisma from "../lib/db";

export default async (req: Request, _: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    req.user = await prisma.user.findFirst({
      where: { apiToken: authorization },
    });
  }
  next();
};
