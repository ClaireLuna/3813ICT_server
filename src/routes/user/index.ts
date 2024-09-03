import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import isUserInRole from "../../middlewares/isUserInRole";

const prisma = new PrismaClient();
const router = Router();

// Get all users
router.get(
  "/user",
  isUserInRole(["SuperAdmin"]),
  async (req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

// Get current user
router.get(
  "/user/current",
  isUserInRole(["User", "Admin", "SuperAdmin"]),
  async (req: Request, res: Response, next) => {
    if (req.user === null) return next();
    try {
      const user = await prisma.user.findFirst({
        where: { id: req.user.id },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
        },
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }
);

// Get a single user by ID
router.get("/user/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Update a user by ID
router.put("/user/:id", async (req: Request, res: Response, next) => {
  if (req.user == null) return next();

  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const loggedInUserId = req.user.id;
    const loggedInUserRole = req.user.role;

    if (loggedInUserRole === "SuperAdmin") {
      const user = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          role,
        },
      });
      res.json(user);
    } else {
      if (id !== loggedInUserId) {
        res
          .status(403)
          .json({ error: "You are not authorized to update this user" });
      } else {
        const user = await prisma.user.update({
          where: {
            id: id,
          },
          data: {
            email,
          },
        });
        res.json(user);
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete a user by ID
router.delete("/user/:id", async (req: Request, res: Response, next) => {
  if (req.user == null) return next();

  try {
    const { id } = req.params;
    const role = req.user.role;

    if (role === "SuperAdmin") {
      await prisma.user.delete({
        where: {
          id: id,
        },
      });
      res.json({ message: "User deleted successfully" });
    } else {
      const userId = req.user.id;
      if (id !== userId) {
        res
          .status(403)
          .json({ error: "You are not authorized to delete this user" });
      } else {
        await prisma.user.delete({
          where: {
            id: id,
          },
        });
        res.json({ message: "User deleted successfully" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
