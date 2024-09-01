import { NextFunction, Request, Response } from "express";
import HttpError from "../errors/HttpError";

function errorMiddleware(
  error: HttpError,
  _: Request,
  response: Response,
  next: NextFunction
) {
  const status = error.status || 500;
  const message = error.message || "Something went wrong";
  response.status(status).send({
    message,
    status,
  });
}

export default errorMiddleware;
