import { Express, NextFunction, Request, Response } from "express";
import chai from "chai";
import chaiHttp from "chai-http";
import { describe, it, afterEach } from "mocha";
import sinon from "sinon";
import prisma from "../src/lib/db";
import * as authMiddleware from "../src/middlewares/authMiddleware";
import { user } from "./testConstants";
import HttpError from "../src/errors/HttpError";

chai.use(chaiHttp);
const { expect } = chai;
const sandbox = sinon.createSandbox();
var app: Express;

describe("User Routes", () => {
  beforeEach(async () => {
    sandbox
      .stub(authMiddleware, "default")
      .callsFake(async (req: Request, _: Response, next: NextFunction) => {
        req.user = user;
        return next();
      });

    prisma.user.findUnique = sandbox.stub().resolves(user);
    prisma.user.findMany = sandbox.stub().resolves([user]);
    prisma.user.findFirst = sandbox.stub().resolves(user);
    prisma.user.update = sandbox.stub().resolves(user);
    prisma.user.delete = sandbox.stub().resolves(user);

    import("../src/index").then((exp) => {
      app = exp.default;
    });
  });

  afterEach(async () => {
    sandbox.restore();
  });

  describe("GET /user", () => {
    it("should return all users", async () => {
      const res = await chai
        .request(app)
        .get("/user")
        .set("authorization", "token");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
    });

    it("should return 500 on error", async () => {
      prisma.user.findMany = sandbox
        .stub()
        .throws(new HttpError(500, "Failed to fetch users"));

      import("../src/index").then((exp) => {
        app = exp.default;
      });

      const res = await chai.request(app).get("/user");
      expect(res).to.have.status(500);
    });
  });

  describe("GET /user/current", () => {
    it("should return current user", async () => {
      const res = await chai.request(app).get("/user/current");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
    });

    it("should return 500 on error", async () => {
      prisma.user.findFirst = sandbox
        .stub()
        .throws(new HttpError(500, "Failed to fetch user"));

      import("../src/index").then((exp) => {
        app = exp.default;
      });

      const res = await chai.request(app).get("/user/current");
      expect(res).to.have.status(500);
    });
  });

  describe("GET /user/:id", () => {
    it("should return a user by ID", async () => {
      const res = await chai.request(app).get("/user/66d6ef35dd3a1615cf637c75");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
    });

    it("should return 404 if user not found", async () => {
      prisma.user.findUnique = sandbox.stub().resolves(null);

      import("../src/index").then((exp) => {
        app = exp.default;
      });

      const res = await chai.request(app).get("/user/66d6ef35dd3a1615cf637c75");
      expect(res).to.have.status(404);
      expect(res.body).to.have.property("error").eql("User not found");
    });

    it("should return 500 on error", async () => {
      prisma.user.findUnique = sandbox
        .stub()
        .throws(new HttpError(500, "Failed to fetch user"));

      import("../src/index").then((exp) => {
        app = exp.default;
      });

      const res = await chai.request(app).get("/user/66d6ef35dd3a1615cf637c75");
      expect(res).to.have.status(500);
    });
  });

  describe("PUT /user/:id", () => {
    it("should update a user by ID", async () => {
      const res = await chai
        .request(app)
        .put("/user/66d6ef35dd3a1615cf637c75")
        .send({ email: "newemail@example.com" });
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
    });

    it("should return 500 on error", async () => {
      prisma.user.update = sandbox
        .stub()
        .throws(new HttpError(500, "Failed to update user"));

      import("../src/index").then((exp) => {
        app = exp.default;
      });

      const res = await chai
        .request(app)
        .put("/user/66d6ef35dd3a1615cf637c75")
        .send({ email: "newemail@example.com" });
      expect(res).to.have.status(500);
    });
  });

  describe("POST /user/photo", () => {
    it("should upload a user photo", async () => {
      const res = await chai
        .request(app)
        .post("/user/photo")
        .send({ photo: "photoData" });
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
    });

    it("should return 500 on error", async () => {
      prisma.user.update = sandbox
        .stub()
        .throws(new HttpError(500, "Failed to upload photo"));

      import("../src/index").then((exp) => {
        app = exp.default;
      });

      const res = await chai
        .request(app)
        .post("/user/photo")
        .send({ photo: "photoData" });
      expect(res).to.have.status(500);
    });
  });

  describe("GET /user/photo/:id", () => {
    it("should return a user photo by ID", async () => {
      const res = await chai
        .request(app)
        .get("/user/photo/66d6ef35dd3a1615cf637c75");
      expect(res).to.have.status(200);
    });

    it("should return 404 if user not found", async () => {
      prisma.user.findUnique = sandbox.stub().resolves(null);
      import("../src/index").then((exp) => {
        app = exp.default;
      });
      const res = await chai
        .request(app)
        .get("/user/photo/66d6ef35dd3a1615cf637c75");
      expect(res).to.have.status(404);
      expect(res.body).to.have.property("error").eql("User not found");
    });

    it("should return 500 on error", async () => {
      prisma.user.findUnique = sandbox
        .stub()
        .throws(new HttpError(500, "Failed to fetch user"));
      import("../src/index").then((exp) => {
        app = exp.default;
      });
      const res = await chai
        .request(app)
        .get("/user/photo/66d6ef35dd3a1615cf637c75");
      expect(res).to.have.status(500);
    });
  });

  describe("DELETE /user/:id", () => {
    it("should delete a user by ID", async () => {
      const res = await chai
        .request(app)
        .delete("/user/66d6ef35dd3a1615cf637c75");
      expect(res).to.have.status(200);
      expect(res.body)
        .to.have.property("message")
        .eql("User deleted successfully");
    });

    it("should return 500 on error", async () => {
      prisma.user.delete = sandbox
        .stub()
        .throws(new HttpError(500, "Failed to delete user"));
      import("../src/index").then((exp) => {
        app = exp.default;
      });

      const res = await chai
        .request(app)
        .delete("/user/66d6ef35dd3a1615cf637c75");
      expect(res).to.have.status(500);
    });
  });
});
