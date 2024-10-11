import express, { Express, Request, Response, json } from "express";
import dotenv from "dotenv";
import logger from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import channelRouter from "./routes/channel";
import authMiddleware from "./middlewares/authMiddleware";
import errorMiddleware from "./middlewares/errorMiddleware";
import groupRouter from "./routes/group";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

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
const server = createServer(app);

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
