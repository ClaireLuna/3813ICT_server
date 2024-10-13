import express, { Request, Response } from "express";
import prisma from "../../lib/db";
import isUserInRole from "../../middlewares/isUserInRole";

const router = express.Router();

// Create Group
router.post(
  "/group",
  isUserInRole(["Admin", "SuperAdmin"]),
  async function (
    req: Request,
    res: Response<{ id: string; name: string } | { error: string }>,
    next
  ) {
    if (req.user == null) return next();

    try {
      const group = await prisma.group.create({
        data: {
          name: req.body.name,
          createdBy: {
            connect: { id: req.user.id },
          },
        },
      });

      await prisma.groupUser.create({
        data: {
          user: {
            connect: { id: req.user.id },
          },
          group: {
            connect: { id: group.id },
          },
        },
      });

      res.send(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to crfeate group" });
    }
  }
);

// Get groups
router.get(
  "/group",
  isUserInRole(["User", "Admin", "SuperAdmin"]),
  async function (
    req,
    res: Response<{ id: string; name: string }[] | { error: string }>,
    next
  ) {
    if (req.user == null) return next();

    try {
      let groups;

      if (req.user.role === "SuperAdmin") {
        groups = await prisma.group.findMany();
      } else {
        groups = await prisma.group.findMany({
          where: {
            GroupUser: {
              some: {
                userId: req.user.id,
              },
            },
          },
        });
      }

      res.send(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  }
);

// Get group by ID
router.get(
  "/group/:id",
  isUserInRole(["User", "Admin", "SuperAdmin"]),
  async function (req: Request<any>, res: Response<any>, next) {
    if (req.user == null) return next();
    try {
      let group = await prisma.group.findUnique({
        where: { id: req.params.id },
      });

      if (!group) {
        return res.status(404).send({ message: "Group not found" });
      }

      res.send(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch group" });
    }
  }
);

// Update group
router.put(
  "/group",
  isUserInRole(["Admin", "SuperAdmin"]),
  async function (
    req: Request,
    res: Response<{ id: string; name: string } | { error: string }>,
    next
  ) {
    if (req.user == null) return next();
    try {
      let group;

      if (req.user.role === "SuperAdmin") {
        group = await prisma.group.update({
          where: { id: req.body.id },
          data: {
            name: req.body.name,
          },
        });
      } else {
        group = await prisma.group.update({
          where: { id: req.body.id, createdBy: { id: req.user.id } },
          data: {
            name: req.body.name,
          },
        });
      }

      res.send(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to update group" });
    }
  }
);

// Remove group
router.delete(
  "/group",
  isUserInRole(["Admin", "SuperAdmin"]),
  async function (
    req: Request,
    res: Response<{ id: string; name: string } | { error: string }>,
    next
  ) {
    if (req.user == null) return next();
    try {
      let group;

      if (req.user.role === "SuperAdmin") {
        group = await prisma.group.delete({
          where: { id: req.body.id },
        });
      } else {
        group = await prisma.group.delete({
          where: { id: req.body.id, createdBy: { id: req.user.id } },
        });
      }

      res.send(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete group" });
    }
  }
);

export default router;
