import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function authMiddleware(
  req: Request,
  _: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;
  if (authorization) {
    req.user = await prisma.user.findFirst({
      where: { apiToken: authorization },
    });
  }
  next();
}
