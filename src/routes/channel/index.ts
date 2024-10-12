import { Router, Request, Response } from "express";
import prisma from "../../lib/db";

const router = Router();

// Get all channels by group ID
router.get(
  "/channel/:groupId",
  async (req: Request<{ groupId: string }>, res: Response) => {
    if (req.user == null)
      return res.status(401).json({ error: "Unauthorized" });
    const { groupId } = req.params;
    try {
      if (req.user.role === "SuperAdmin") {
        const channels = await prisma.channel.findMany({
          where: { groupId: groupId },
        });
        res.json(channels);
      } else {
        const channels = await prisma.channel.findMany({
          where: {
            groupId: groupId,
            group: { GroupUser: { some: { id: req.user.id } } },
          },
        });
        if (channels.length === 0) {
          res.status(401).json({ error: "Unauthorized" });
        } else {
          res.json(channels);
        }
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get a channel by ID
router.get(
  "/channel/get/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    if (req.user == null)
      return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    try {
      const channel = await prisma.channel.findFirst({
        where: { id: id },
      });

      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      } else if (req.user.role === "SuperAdmin") {
        return res.json(channel);
      }

      const userChannel = await prisma.channel.findFirst({
        where: {
          id: id,
          group: { GroupUser: { some: { id: req.user.id } } },
        },
      });

      if (!userChannel) {
        return res.status(401).json({ error: "Unauthorized" });
      } else {
        return res.json(channel);
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Create a new channel
router.post(
  "/channel/:groupId",
  async (req: Request<{ groupId: string }>, res: Response) => {
    if (req.user == null)
      return res.status(401).json({ error: "Unauthorized" });
    const { name } = req.body;
    const { groupId } = req.params;
    try {
      const channel = await prisma.channel.create({
        data: { name, group: { connect: { id: groupId } } },
      });
      res.json(channel);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update a channel by ID
router.put(
  "/channel/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    if (req.user == null)
      return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { name } = req.body;
    try {
      const updatedChannel = await prisma.channel.update({
        where: { id: id },
        data: { name },
      });
      res.json(updatedChannel);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete a channel by ID
router.delete(
  "/channel/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    if (req.user == null)
      return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    try {
      await prisma.channel.delete({ where: { id: id } });
      res.json({ message: "Channel deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
