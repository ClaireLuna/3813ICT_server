import { Express } from "express";
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
    prisma.user.findFirst = sandbox.stub().resolves(null);
    prisma.user.create = sandbox.stub().resolves(user);

    import("../src/index").then((exp) => {
      app = exp.default;
    });
  });

  afterEach(async () => {
    sandbox.restore();
  });

  describe("POST /register", () => {
    it("should register a new user", async () => {
      const res = await chai.request(app).post("/register").send({
        username: "testuser",
        email: "newuser@example.com",
        password: "password",
      });

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property("username").eql("user1");
    });

    it("should return 403 if username already exists", async () => {
      sandbox.restore();

      prisma.user.findFirst = sandbox.stub().resolves(user);

      import("../src/index").then((exp) => {
        app = exp.default;
      });

      const res = await chai.request(app).post("/register").send({
        username: "user1",
        email: "existinguser@example.com",
        password: "password",
      });
      expect(res).to.have.status(403);
    });

    it("should return 401 on error", async () => {
      sandbox.restore();
      prisma.user.create = sandbox.stub().resolves(null);

      await import("../src/index").then((exp) => {
        app = exp.default;
      });

      const res = await chai.request(app).post("/register").send({
        username: "newuser",
        email: "newuser@example.com",
        password: "password",
      });

      expect(res).to.have.status(401);
    });
  });

  describe("POST /login", () => {
    it("should login a user", async () => {
      prisma.user.findFirst = sandbox.stub().resolves(user);

      await import("../src/index").then((exp) => {
        app = exp.default;
      });

      const res = await chai
        .request(app)
        .post("/login")
        .send({ username: "existinguser", password: "password" });

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property("username").eql("user1");
    });

    it("should return 403 if invalid credentials", async () => {
      const res = await chai
        .request(app)
        .post("/login")
        .send({ username: "nonexistentuser", password: "wrongpassword" });

      expect(res).to.have.status(403);
    });
  });
});
