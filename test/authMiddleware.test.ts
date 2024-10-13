import { Request, Response, NextFunction } from "express";
import chai from "chai";
import chaiHttp from "chai-http";
import { describe, it, beforeEach, afterEach } from "mocha";
import sinon from "sinon";
import prisma from "../src/lib/db";
import authMiddleware from "../src/middlewares/authMiddleware";
import { user } from "./testConstants";

chai.use(chaiHttp);
const { expect } = chai;
const sandbox = sinon.createSandbox();

describe("Auth Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonSpy;

  beforeEach(async () => {
    req = {
      headers: {},
    };
    res = {};
    next = sandbox.spy();
  });

  afterEach(async () => {
    sandbox.restore();
  });

  it("should set user in request if authorization header is present and valid", async () => {
    prisma.user.findFirst = sandbox.stub().resolves(user);
    req.headers = req.headers || {};
    req.headers.authorization = "token";

    await authMiddleware(
      req as Request,
      res as Response,
      next as unknown as NextFunction
    );

    expect(req.user).to.equal(user);
    expect(next.calledOnce).to.be.true;
  });

  it("should not set user in request if authorization header is present but invalid", async () => {
    sandbox.restore();
    req.headers = req.headers || {};
    req.headers.authorization = "invalid_token";

    await authMiddleware(req as Request, res as Response, next);

    expect(req.user?.id).to.be.undefined;
    expect(next.calledOnce).to.be.true;
  });

  it("should not set user in request if authorization header is absent", async () => {
    await authMiddleware(req as Request, res as Response, next);

    expect(req.user).to.be.undefined;
    expect(next.calledOnce).to.be.true;
  });
});
