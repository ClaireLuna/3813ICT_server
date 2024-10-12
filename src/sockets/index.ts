import { Server } from "socket.io";
import http = require("http");
import type { Server as HTTPSServer } from "https";
import type { Http2SecureServer, Http2Server } from "http2";
import prisma from "../lib/db";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  MessageResponse,
} from "./types";

export const createSocketServer = (
  server: http.Server | HTTPSServer | Http2SecureServer | Http2Server | number
) => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const { token, channelId } = socket.handshake.auth;
      if (!token) {
        throw new Error("Unauthorized");
      }
      const user = await prisma.user.findFirst({
        where: { apiToken: token },
        select: { id: true, username: true },
      });
      if (!user?.id) {
        throw new Error("Unauthorized");
      }
      socket.data.user = user;
      socket.data.channelId = channelId;
      socket.join(channelId);
      next();
    } catch (e) {
      next(new Error("Unauthorized"));
    }
  });

  io.engine.on("connection_error", (err) => {
    console.error(err.req);
  });

  io.on("connection", async (socket) => {
    io.in(socket.data.channelId).emit("userJoined", socket.data.user.username);

    io.emit("userId", socket.id);
    io.to(socket.id).emit("ownId", socket.id);
    socket.on("peerId", (message) => {
      io.emit("peerId", message);
      console.log("peerId: " + message);
    });

    const messages = await prisma.message.findMany({
      where: { channelId: socket.data.channelId },
      select: {
        user: { select: { id: true, username: true } },
        content: true,
        image: true,
      },
    });

    socket.emit("allMessages", messages);

    socket.on("sendMessage", async (request) => {
      const channelId = socket.data.channelId;
      const msg = await prisma.message.create({
        data: {
          content: request.content,
          image: request.image,
          channel: { connect: { id: channelId } },
          user: { connect: { id: socket.data.user.id } },
        },
        select: {
          user: { select: { id: true, username: true } },
          content: true,
          image: true,
        },
      });
      io.in(channelId).emit("newMessage", {
        user: msg.user,
        content: msg.content,
        image: msg.image,
      });
    });

    socket.on("disconnect", () => {
      io.in(socket.data.channelId).emit("userLeft", socket.data.user.username);
    });
  });
  return io;
};
