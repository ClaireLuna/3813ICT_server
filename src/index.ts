import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { json } from "body-parser";
import dotenv from "dotenv";
import errorMiddleware from "./middlewares/errorMiddleware";
import authMiddleware from "./middlewares/authMiddleware";
import authRouter from "./routes/auth";
import groupRouter from "./routes/group";

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

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
