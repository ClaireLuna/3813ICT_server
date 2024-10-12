import express, { Express, Request, Response, json } from "express";
import fs from "fs";
import dotenv from "dotenv";
import logger from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "https";
import channelRouter from "./routes/channel";
import authMiddleware from "./middlewares/authMiddleware";
import errorMiddleware from "./middlewares/errorMiddleware";
import groupRouter from "./routes/group";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import { PeerServer } from "peer";
import { createSocketServer } from "./sockets";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const peerPort = Number(process.env.PEER_PORT) || 3001;
const sslOptions = {
  key: fs.readFileSync("cert.key").toString(),
  cert: fs.readFileSync("cert.pem").toString(),
};

app.use(logger("dev"));
app.use(json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use(authMiddleware);
app.use(errorMiddleware);

app.use("/", groupRouter);
app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", channelRouter);

// Create HTTP server
const server = createServer(sslOptions, app);

createSocketServer(server);

server.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});

PeerServer({ port: peerPort, path: "/", ssl: sslOptions }, () => {
  console.log(
    `[peer]: Peer server is running at https://localhost:${peerPort}`
  );
});

export default app;
