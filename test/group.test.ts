import { Express, NextFunction, Request, Response } from "express";
import chai from "chai";
import chaiHttp from "chai-http";
import { describe, it, beforeEach, afterEach } from "mocha";
import sinon from "sinon";
import prisma from "../src/lib/db";
import * as authMiddleware from "../src/middlewares/authMiddleware";
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
    sandbox.stub(prisma.group, "create").resolves(group);
    sandbox.stub(prisma.group, "findMany").resolves([group]);
    sandbox.stub(prisma.group, "findUnique").resolves(group);
    sandbox.stub(prisma.group, "update").resolves(group);
    sandbox.stub(prisma.group, "delete").resolves(group);

    app = (await import("../src/index")).default;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("POST /group", () => {
    it("should create a group", () => {
      return chai
        .request(app)
        .post("/group")
        .send({ name: "New Group" })
        .end((_err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("id");
          expect(res.body).to.have.property("name", "New Group");
        });
    });

    it("should return 500 on error", () => {
      sandbox
        .stub(prisma.group, "create")
        .throws(new Error("Failed to create group"));
      return chai
        .request(app)
        .post("/group")
        .send({ name: "New Group" })
        .end((_err, res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("error", "Failed to create group");
        });
    });
  });

  describe("GET /group", () => {
    it("should return all groups for SuperAdmin", () => {
      return chai
        .request(app)
        .get("/group")
        .end((_err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
        });
    });

    it("should return 500 on error", () => {
      sandbox
        .stub(prisma.group, "findMany")
        .throws(new Error("Failed to fetch groups"));
      return chai
        .request(app)
        .get("/group")
        .end((_err, res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("error", "Failed to fetch groups");
        });
    });
  });

  describe("GET /group/:id", () => {
    it("should return a group by ID", () => {
      return chai
        .request(app)
        .get("/group/group1")
        .end((_err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("id", "group1");
        });
    });

    it("should return 404 if group not found", () => {
      sandbox.stub(prisma.group, "findUnique").resolves(null);
      return chai
        .request(app)
        .get("/group/group1")
        .end((_err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("message", "Group not found");
        });
    });

    it("should return 500 on error", () => {
      sandbox
        .stub(prisma.group, "findUnique")
        .throws(new Error("Failed to fetch group"));
      return chai
        .request(app)
        .get("/group/group1")
        .end((_err, res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("error", "Failed to fetch group");
        });
    });
  });

  describe("PUT /group", () => {
    it("should update a group", () => {
      return chai
        .request(app)
        .put("/group")
        .send({ id: "group1", name: "Updated Group" })
        .end((_err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("name", "Updated Group");
        });
    });

    it("should return 500 on error", () => {
      sandbox
        .stub(prisma.group, "update")
        .throws(new Error("Failed to update group"));
      return chai
        .request(app)
        .put("/group")
        .send({ id: "group1", name: "Updated Group" })
        .end((_err, res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("error", "Failed to update group");
        });
    });
  });

  describe("DELETE /group", () => {
    it("should delete a group", () => {
      return chai
        .request(app)
        .delete("/group")
        .send({ id: "group1" })
        .end((_err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("id", "group1");
        });
    });

    it("should return 500 on error", () => {
      sandbox
        .stub(prisma.group, "delete")
        .throws(new Error("Failed to delete group"));
      return chai
        .request(app)
        .delete("/group")
        .send({ id: "group1" })
        .end((_err, res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("error", "Failed to delete group");
        });
    });
  });
});
