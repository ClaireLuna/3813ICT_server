import { Express, NextFunction, Request, Response } from "express";
import chai from "chai";
import chaiHttp from "chai-http";
import { describe, it, beforeEach, afterEach } from "mocha";
import sinon from "sinon";
import prisma from "../src/lib/db";
import { user } from "./testConstants";

chai.use(chaiHttp);
const { expect } = chai;
const sandbox = sinon.createSandbox();
let app: Express;

describe("Auth Routes", () => {
  beforeEach(async () => {
    sandbox.stub(prisma.user, "findFirst").resolves(null);
    sandbox.stub(prisma.user, "create").resolves(user);

    app = (await import("../src/index")).default;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("POST /register", () => {
    it("should register a new user", () => {
      return chai
        .request(app)
        .post("/auth/register")
        .send({
          username: "newuser",
          email: "newuser@example.com",
          password: "password",
        })
        .end((_err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("username").eql("newuser");
        });
    });

    it("should return 403 if username already exists", () => {
      sandbox.stub(prisma.user, "findFirst").resolves(user);
      return chai
        .request(app)
        .post("/auth/register")
        .send({
          username: "existinguser",
          email: "existinguser@example.com",
          password: "password",
        })
        .end((_err, res) => {
          expect(res).to.have.status(403);
          expect(res.body)
            .to.have.property("error")
            .eql("Username already exists");
        });
    });

    it("should return 500 on error", () => {
      sandbox
        .stub(prisma.user, "create")
        .throws(new Error("Failed to create user"));
      return chai
        .request(app)
        .post("/auth/register")
        .send({
          username: "newuser",
          email: "newuser@example.com",
          password: "password",
        })
        .end((_err, res) => {
          expect(res).to.have.status(500);
          expect(res.body)
            .to.have.property("error")
            .eql("Internal server error");
        });
    });
  });

  describe("POST /login", () => {
    it("should login a user", () => {
      sandbox.stub(prisma.user, "findFirst").resolves(user);
      return chai
        .request(app)
        .post("/auth/login")
        .send({ username: "existinguser", password: "password" })
        .end((_err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("username").eql("existinguser");
        });
    });

    it("should return 403 if invalid credentials", () => {
      return chai
        .request(app)
        .post("/auth/login")
        .send({ username: "nonexistentuser", password: "wrongpassword" })
        .end((_err, res) => {
          expect(res).to.have.status(403);
          expect(res.body).to.have.property("error").eql("Unauthorised");
        });
    });

    it("should return 500 on error", () => {
      sandbox
        .stub(prisma.user, "findFirst")
        .throws(new Error("Failed to fetch user"));
      return chai
        .request(app)
        .post("/auth/login")
        .send({ username: "existinguser", password: "password" })
        .end((_err, res) => {
          expect(res).to.have.status(500);
          expect(res.body)
            .to.have.property("error")
            .eql("Internal server error");
        });
    });
  });
});
