import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import isUserInRole from "../../middlewares/isUserInRole";

const prisma = new PrismaClient();
const router = express.Router();

router.post(
  "/group/create",
  isUserInRole(["Admin", "SuperAdmin"]),
  async function (req: Request, res: Response<{ id: string }>, next) {
    if (req.user == null) return next();

    const group = await prisma.group.create({
      data: { name: req.body.name, createdById: req.user?.id },
    });

    res.send({ id: group.id });
  }
);
router.get(
  "/group",
  isUserInRole(["User", "Admin", "SuperAdmin"]),
  async function (
    req: Request,
    res: Response<{ id: string; name: string }[]>,
    next
  ) {
    if (req.user == null) return next();

    const groups = await prisma.group.findMany({});

    res.send(
      groups.map((g) => ({
        id: g.id,
        name: g.name,
      }))
    );
  }
);

export default router;
