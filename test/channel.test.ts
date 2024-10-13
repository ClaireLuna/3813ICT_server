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
    sandbox.stub(prisma.channel, "findMany").resolves(channels);
    sandbox.stub(prisma.channel, "findFirst").resolves(channel);
    sandbox.stub(prisma.channel, "create").resolves(channel);
    sandbox.stub(prisma.channel, "update").resolves(channel);
    sandbox.stub(prisma.channel, "delete").resolves(channel);

    app = (await import("../src/index")).default;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("GET /channel/:groupId", () => {
    it("should return all channels for a group", () => {
      return async (resolve: () => void): Promise<void> => {
        return chai
          .request(app)
          .get("/channel/66d6ef35dd3a1615cf637c75")
          .set("authorization", "token")
          .end((_err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            resolve();
          });
      };
    });

    it("should return 401 if unauthorized", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox.restore();
        return chai
          .request(app)
          .get("/channel/66d6ef35dd3a1615cf637c75")
          .end((_err, res) => {
            expect(res).to.have.status(401);
            expect(res.body).to.have.property("error").eql("Unauthorized");
            resolve();
          });
      };
    });

    it("should return 500 on error", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox
          .stub(prisma.channel, "findMany")
          .throws(new Error("Failed to fetch channels"));
        return chai
          .request(app)
          .get("/channel/66d6ef35dd3a1615cf637c75")
          .set("authorization", "token")
          .end((_err, res) => {
            expect(res).to.have.status(500);
            expect(res.body)
              .to.have.property("error")
              .eql("Internal server error");
            resolve();
          });
      };
    });
  });

  describe("GET /channel/get/:id", () => {
    it("should return a channel by ID", () => {
      return async (resolve: () => void): Promise<void> => {
        return chai
          .request(app)
          .get("/channel/get/66d6ef35dd3a1615cf637c75")
          .set("authorization", "token")
          .end((_err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            resolve();
          });
      };
    });

    it("should return 404 if channel not found", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox.stub(prisma.channel, "findFirst").resolves(null);
        return chai
          .request(app)
          .get("/channel/get/66d6ef35dd3a1615cf637c75")
          .set("authorization", "token")
          .end((_err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.have.property("error").eql("Channel not found");
            resolve();
          });
      };
    });

    it("should return 401 if unauthorized", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox.restore();
        return chai
          .request(app)
          .get("/channel/get/66d6ef35dd3a1615cf637c75")
          .end((_err, res) => {
            expect(res).to.have.status(401);
            expect(res.body).to.have.property("error").eql("Unauthorized");
            resolve();
          });
      };
    });

    it("should return 500 on error", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox
          .stub(prisma.channel, "findFirst")
          .throws(new Error("Failed to fetch channel"));
        return chai
          .request(app)
          .get("/channel/get/66d6ef35dd3a1615cf637c75")
          .set("authorization", "token")
          .end((_err, res) => {
            expect(res).to.have.status(500);
            expect(res.body)
              .to.have.property("error")
              .eql("Internal server error");
            resolve();
          });
      };
    });
  });

  describe("POST /channel/:groupId", () => {
    it("should create a new channel", () => {
      return async (resolve: () => void): Promise<void> => {
        return chai
          .request(app)
          .post("/channel/66d6ef35dd3a1615cf637c75")
          .set("authorization", "token")
          .send({ name: "New Channel" })
          .end((_err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            resolve();
          });
      };
    });

    it("should return 401 if unauthorized", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox.restore();
        return chai
          .request(app)
          .post("/channel/66d6ef35dd3a1615cf637c75")
          .send({ name: "New Channel" })
          .end((_err, res) => {
            expect(res).to.have.status(401);
            expect(res.body).to.have.property("error").eql("Unauthorized");
            resolve();
          });
      };
    });

    it("should return 500 on error", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox
          .stub(prisma.channel, "create")
          .throws(new Error("Failed to create channel"));
        return chai
          .request(app)
          .post("/channel/66d6ef35dd3a1615cf637c75")
          .set("authorization", "token")
          .send({ name: "New Channel" })
          .end((_err, res) => {
            expect(res).to.have.status(500);
            expect(res.body)
              .to.have.property("error")
              .eql("Internal server error");
            resolve();
          });
      };
    });
  });

  describe("PUT /channel/:id", () => {
    it("should update a channel by ID", () => {
      return async (resolve: () => void): Promise<void> => {
        return chai
          .request(app)
          .put("/channel/66d6ef35dd3a1615cf637c75")
          .set("authorization", "token")
          .send({ name: "Updated Channel" })
          .end((_err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            resolve();
          });
      };
    });

    it("should return 401 if unauthorized", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox.restore();
        return chai
          .request(app)
          .put("/channel/66d6ef35dd3a1615cf637c75")
          .send({ name: "Updated Channel" })
          .end((_err, res) => {
            expect(res).to.have.status(401);
            expect(res.body).to.have.property("error").eql("Unauthorized");
            resolve();
          });
      };
    });

    it("should return 500 on error", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox
          .stub(prisma.channel, "update")
          .throws(new Error("Failed to update channel"));
        return chai
          .request(app)
          .put("/channel/66d6ef35dd3a1615cf637c75")
          .set("authorization", "token")
          .send({ name: "Updated Channel" })
          .end((_err, res) => {
            expect(res).to.have.status(500);
            expect(res.body)
              .to.have.property("error")
              .eql("Internal server error");
            resolve();
          });
      };
    });
  });

  describe("DELETE /channel/:id", () => {
    it("should delete a channel by ID", () => {
      return async (resolve: () => void): Promise<void> => {
        return chai
          .request(app)
          .delete("/channel/66d6ef35dd3a1615cf637c75")
          .set("authorization", "token")
          .end((_err, res) => {
            expect(res).to.have.status(200);
            expect(res.body)
              .to.have.property("message")
              .eql("Channel deleted successfully");
            resolve();
          });
      };
    });

    it("should return 401 if unauthorized", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox.restore();
        return chai
          .request(app)
          .delete("/channel/66d6ef35dd3a1615cf637c75")
          .end((_err, res) => {
            expect(res).to.have.status(401);
            expect(res.body).to.have.property("error").eql("Unauthorized");
            resolve();
          });
      };
    });

    it("should return 500 on error", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox
          .stub(prisma.channel, "delete")
          .throws(new Error("Failed to delete channel"));
        return chai
          .request(app)
          .delete("/channel/66d6ef35dd3a1615cf637c75")
          .set("authorization", "token")
          .end((_err, res) => {
            expect(res).to.have.status(500);
            expect(res.body)
              .to.have.property("error")
              .eql("Internal server error");
            resolve();
          });
      };
    });
  });
});
