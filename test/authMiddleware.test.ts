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

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = sandbox.spy();
    sandbox.stub(prisma.user, "findFirst").resolves(user);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should set user in request if authorization header is present and valid", () => {
    return async (resolve: () => void): Promise<void> => {
      req.headers = req.headers || {};
      req.headers.authorization = "token";

      await authMiddleware(
        req as Request,
        res as Response,
        next as unknown as NextFunction
      );

      expect(req.user).to.equal(user);
      expect(next.calledOnce).to.be.true;
      resolve();
    };
  });

  it("should not set user in request if authorization header is present but invalid", () => {
    return async (resolve: () => void): Promise<void> => {
      req.headers = req.headers || {};
      req.headers.authorization = "invalid_token";

      await authMiddleware(req as Request, res as Response, next);

      expect(req.user).to.be.undefined;
      expect(next.calledOnce).to.be.true;
      resolve();
    };
  });

  it("should not set user in request if authorization header is absent", () => {
    return async (resolve: () => void): Promise<void> => {
      await authMiddleware(req as Request, res as Response, next);

      expect(req.user).to.be.undefined;
      expect(next.calledOnce).to.be.true;
      resolve();
    };
  });
});
