import express, { Request, Response } from "express";
import HttpError from "../../errors/HttpError";
import prisma from "../../lib/db";
import { createHash } from "crypto";

export interface LoginModel {
  username: string;
  password: string;
}

export interface RegisterModel {
  username: string;
  password: string;
}

const router = express.Router();

router.post(
  "/register",
  async function (req: Request<RegisterModel>, res: Response, next) {
    const { username, email, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { username: req.body.username },
    });
    if (user) {
      next(new HttpError(403, "Username already exists"));
    } else {
      const hash = createHash("sha256").update(password).digest("hex");
      const token = createHash("sha256").update(username).digest("hex");
      const user = await prisma.user.create({
        data: {
          username: username,
          email: email,
          hash: hash,
          apiToken: token,
          role: "User",
        },
        select: {
          id: true,
          username: true,
          email: true,
          apiToken: true,
          role: true,
        },
      });
      if (user?.id) {
        res.json(user);
      } else {
        next(new HttpError(401, "Bad Request"));
      }
    }
  }
);

router.post(
  "/login",
  async function (req: Request<LoginModel>, res: Response<any>, next) {
    const hash = createHash("sha256").update(req.body.password).digest("hex");
    const user = await prisma.user.findFirst({
      where: { username: req.body.username, hash: hash },
      select: {
        id: true,
        username: true,
        email: true,
        apiToken: true,
        role: true,
      },
    });
    if (user) {
      res.json(user);
    } else {
      next(new HttpError(403, "Unauthorised"));
    }
  }
);

export default router;
