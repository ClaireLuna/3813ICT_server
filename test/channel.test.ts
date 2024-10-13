import { Express, NextFunction, Request, Response } from "express";
import chai from "chai";
import chaiHttp from "chai-http";
import { describe, it, beforeEach, afterEach } from "mocha";
import sinon from "sinon";
import prisma from "../src/lib/db";
import * as authMiddleware from "../src/middlewares/authMiddleware";
import { user, channel, channels } from "./testConstants";

chai.use(chaiHttp);
const { expect } = chai;
const sandbox = sinon.createSandbox();
let app: Express;

describe("Channel Routes", () => {
  beforeEach(async () => {
    sandbox
      .stub(authMiddleware, "default")
      .callsFake(async (req: Request, _: Response, next: NextFunction) => {
        req.user = user;
        return next();
      });
    prisma.channel.findMany = sandbox.stub().resolves(channels);
    prisma.channel.findFirst = sandbox.stub().resolves(channel);
    prisma.channel.create = sandbox.stub().resolves(channel);
    prisma.channel.update = sandbox.stub().resolves(channel);
    prisma.channel.delete = sandbox.stub().resolves(channel);

    import("../src/index").then((exp) => {
      app = exp.default;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("GET /channel/:groupId", () => {
    it("should return all channels for a group", async () => {
      const res = await chai
        .request(app)
        .get("/channel/66d6ef35dd3a1615cf637c75")
        .set("authorization", "token");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
    });

    it("should return 500 on error", async () => {
      prisma.channel.findMany = sandbox
        .stub()
        .throws(new Error("Failed to fetch channels"));
      const res = await chai
        .request(app)
        .get("/channel/66d6ef35dd3a1615cf637c75")
        .set("authorization", "token");
      expect(res).to.have.status(500);
      expect(res.body).to.have.property("error").eql("Internal server error");
    });
  });

  describe("GET /channel/get/:id", () => {
    it("should return a channel by ID", async () => {
      const res = await chai
        .request(app)
        .get("/channel/get/66d6ef35dd3a1615cf637c75")
        .set("authorization", "token");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
    });

    it("should return 404 if channel not found", async () => {
      prisma.channel.findFirst = sandbox.stub().resolves(null);
      const res = await chai
        .request(app)
        .get("/channel/get/66d6ef35dd3a1615cf637c75")
        .set("authorization", "token");
      expect(res).to.have.status(404);
      expect(res.body).to.have.property("error").eql("Channel not found");
    });

    it("should return 500 on error", async () => {
      prisma.channel.findFirst = sandbox
        .stub()
        .throws(new Error("Failed to fetch channel"));
      const res = await chai
        .request(app)
        .get("/channel/get/66d6ef35dd3a1615cf637c75")
        .set("authorization", "token");
      expect(res).to.have.status(500);
      expect(res.body).to.have.property("error").eql("Internal server error");
    });
  });

  describe("POST /channel/:groupId", () => {
    it("should create a new channel", async () => {
      const res = await chai
        .request(app)
        .post("/channel/66d6ef35dd3a1615cf637c75")
        .set("authorization", "token")
        .send({ name: "New Channel" });
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
    });

    it("should return 500 on error", async () => {
      prisma.channel.create = sandbox
        .stub()
        .throws(new Error("Failed to create channel"));
      const res = await chai
        .request(app)
        .post("/channel/66d6ef35dd3a1615cf637c75")
        .set("authorization", "token")
        .send({ name: "New Channel" });
      expect(res).to.have.status(500);
      expect(res.body).to.have.property("error").eql("Internal server error");
    });
  });

  describe("PUT /channel/:id", () => {
    it("should update a channel by ID", async () => {
      const res = await chai
        .request(app)
        .put("/channel/66d6ef35dd3a1615cf637c75")
        .set("authorization", "token")
        .send({ name: "Updated Channel" });
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
    });

    it("should return 500 on error", async () => {
      prisma.channel.update = sandbox
        .stub()
        .throws(new Error("Failed to update channel"));
      const res = await chai
        .request(app)
        .put("/channel/66d6ef35dd3a1615cf637c75")
        .set("authorization", "token")
        .send({ name: "Updated Channel" });
      expect(res).to.have.status(500);
      expect(res.body).to.have.property("error").eql("Internal server error");
    });
  });

  describe("DELETE /channel/:id", () => {
    it("should delete a channel by ID", async () => {
      const res = await chai
        .request(app)
        .delete("/channel/66d6ef35dd3a1615cf637c75")
        .set("authorization", "token");
      expect(res).to.have.status(200);
      expect(res.body)
        .to.have.property("message")
        .eql("Channel deleted successfully");
    });

    it("should return 500 on error", async () => {
      prisma.channel.delete = sandbox
        .stub()
        .throws(new Error("Failed to delete channel"));
      const res = await chai
        .request(app)
        .delete("/channel/66d6ef35dd3a1615cf637c75")
        .set("authorization", "token");
      expect(res).to.have.status(500);
      expect(res.body).to.have.property("error").eql("Internal server error");
    });
  });
});
