import { Request, Response, NextFunction } from "express";
import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
chai.use(sinonChai);
import { describe, it, beforeEach, afterEach } from "mocha";
import errorMiddleware from "../src/middlewares/errorMiddleware";
import HttpError from "../src/errors/HttpError";

const { expect } = chai;
const sandbox = sinon.createSandbox();

describe("Error Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonSpy;

  beforeEach(async () => {
    req = {};
    res = {
      status: sandbox.stub().returnsThis(),
      send: sandbox.stub(),
    };
    next = sandbox.stub();
  });

  afterEach(async () => {
    sandbox.restore();
  });

  it("should return the correct status and message for a given HttpError", () => {
    const error = new HttpError(404, "Not Found");
    errorMiddleware(error, req as Request, res as Response, next);

    expect(res.status).to.have.been.calledWith(404);
    expect(res.send).to.have.been.calledWith({
      message: "Not Found",
      status: 404,
    });
  });
});
