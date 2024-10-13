import { Express, NextFunction, Request, Response } from "express";
import chai from "chai";
import chaiHttp from "chai-http";
import { describe, it, beforeEach, afterEach } from "mocha";
import sinon from "sinon";
import prisma from "../src/lib/db";
import * as authMiddleware from "../src/middlewares/authMiddleware";
import * as isUserInRole from "../src/middlewares/isUserInRole";
import { group, user } from "./testConstants";

chai.use(chaiHttp);
const { expect } = chai;
const sandbox = sinon.createSandbox();
var app: Express;

describe("Group Routes", () => {
  beforeEach(async () => {
    sandbox
      .stub(authMiddleware, "default")
      .callsFake(async (req: Request, _: Response, next: NextFunction) => {
        req.user = user;
        return next();
      });
    sandbox.stub(isUserInRole, "default").callsFake((_role) => {
      return (_req: Request, _: Response, next: NextFunction) => {
        return next();
      };
    });
    prisma.group.create = sandbox.stub().resolves(group);
    prisma.groupUser.create = sandbox
      .stub()
      .resolves({ groupId: group.id, userId: user.id });
    prisma.group.findMany = sandbox.stub().resolves([group]);
    prisma.group.findUnique = sandbox.stub().resolves(group);
    prisma.group.update = sandbox.stub().resolves(group);
    prisma.group.delete = sandbox.stub().resolves(group);

    await import("../src/index").then((exp) => {
      app = exp.default;
    });
  });

  afterEach(async () => {
    sandbox.restore();
  });

  describe("POST /group", () => {
    it("should create a group", async () => {
      const res = await chai
        .request(app)
        .post("/group")
        .send({ name: "Test Group" });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("id");
      expect(res.body).to.have.property("name", "Test Group");
    });

    it("should return 500 on error", async () => {
      prisma.group.create = sandbox
        .stub()
        .throws(new Error("Failed to create group"));

      prisma.groupUser.create = sandbox
        .stub()
        .throws(new Error("Failed to create group user"));

      import("../src/index").then((exp) => {
        app = exp.default;
      });

      const res = await chai
        .request(app)
        .post("/group")
        .send({ name: "New Group" });

      expect(res).to.have.status(500);
    });
  });

  describe("GET /group", () => {
    it("should return all groups for SuperAdmin", async () => {
      const res = await chai.request(app).get("/group");

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
    });

    it("should return 500 on error", async () => {
      prisma.group.findMany = sandbox
        .stub()
        .throws(new Error("Failed to fetch groups"));

      const res = await chai.request(app).get("/group");

      expect(res).to.have.status(500);
      expect(res.body).to.have.property("error", "Failed to fetch groups");
    });
  });

  describe("GET /group/:id", () => {
    it("should return a group by ID", async () => {
      const res = await chai
        .request(app)
        .get("/group/66d6ef35dd3a1615cf637c75");

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("id", "66d6ef35dd3a1615cf637c75");
    });

    it("should return 404 if group not found", async () => {
      prisma.group.findUnique = sandbox.stub().resolves(null);

      const res = await chai.request(app).get("/group/group1");

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message", "Group not found");
    });

    it("should return 500 on error", async () => {
      prisma.group.findUnique = sandbox
        .stub()
        .throws(new Error("Failed to fetch group"));

      const res = await chai.request(app).get("/group/group1");

      expect(res).to.have.status(500);
      expect(res.body).to.have.property("error", "Failed to fetch group");
    });
  });

  describe("PUT /group", () => {
    it("should update a group", async () => {
      const res = await chai
        .request(app)
        .put("/group")
        .send({ id: "group1", name: "Test Group" });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("name", "Test Group");
    });

    it("should return 500 on error", async () => {
      prisma.group.update = sandbox
        .stub()
        .throws(new Error("Failed to update group"));

      const res = await chai
        .request(app)
        .put("/group")
        .send({ id: "group1", name: "Updated Group" });

      expect(res).to.have.status(500);
      expect(res.body).to.have.property("error", "Failed to update group");
    });
  });

  describe("DELETE /group", () => {
    it("should delete a group", async () => {
      const res = await chai
        .request(app)
        .delete("/group")
        .send({ id: "66d6ef35dd3a1615cf637c75" });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("id", "66d6ef35dd3a1615cf637c75");
    });

    it("should return 500 on error", async () => {
      prisma.group.delete = sandbox
        .stub()
        .throws(new Error("Failed to delete group"));

      const res = await chai
        .request(app)
        .delete("/group")
        .send({ id: "group1" });

      expect(res).to.have.status(500);
      expect(res.body).to.have.property("error", "Failed to delete group");
    });
  });
});
