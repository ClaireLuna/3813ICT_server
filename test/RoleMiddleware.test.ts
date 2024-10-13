import { Request, Response, NextFunction } from "express";
import chai from "chai";
import sinon from "sinon";
import { describe, it, beforeEach, afterEach } from "mocha";
import isUserInRole from "../src/middlewares/isUserInRole";
import HttpError from "../src/errors/HttpError";
import { Role } from "@prisma/client";
import { user } from "./testConstants";

const { expect } = chai;
const sandbox = sinon.createSandbox();

describe("isUserInRole Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonSpy;

  beforeEach(async () => {
    req = {
      user: user,
    };
    res = {};
    next = sandbox.spy();
  });

  afterEach(async () => {
    sandbox.restore();
  });

  it("should call next if user role matches single role", () => {
    const middleware = isUserInRole(Role.SuperAdmin);
    middleware(req as Request, res as Response, next);
    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args).to.be.empty;
  });

  it("should call next if user role matches one of multiple roles", () => {
    const middleware = isUserInRole([Role.SuperAdmin, Role.Admin]);
    middleware(req as Request, res as Response, next);
    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args).to.be.empty;
  });

  it("should call next with HttpError if user role does not match", () => {
    const middleware = isUserInRole(Role.Admin);
    middleware(req as Request, res as Response, next);
    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.be.instanceOf(HttpError);
    expect((next.firstCall.args[0] as HttpError).status).to.equal(403);
    expect((next.firstCall.args[0] as HttpError).message).to.equal(
      "Unauthorised"
    );
  });
});
