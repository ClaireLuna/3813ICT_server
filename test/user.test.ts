import { Express, NextFunction, Request, Response } from "express";
import chai from "chai";
import chaiHttp from "chai-http";
import { describe, it, afterEach } from "mocha";
import sinon from "sinon";
import prisma from "../src/lib/db";
import { Role } from "@prisma/client";
import * as authMiddleware from "../src/middlewares/authMiddleware";

chai.use(chaiHttp);
const { expect } = chai;
const sandbox = sinon.createSandbox();
var app: Express;

const user = {
  id: "66d6ef35dd3a1615cf637c75",
  username: "user1",
  photo: null,
  email: "asd@asd.com",
  hash: "asdasd",
  apiToken: "token",
  role: Role.SuperAdmin,
};

describe("User Routes", () => {
  beforeEach(async () => {
    sandbox
      .stub(authMiddleware, "default")
      .callsFake(async (req: Request, _: Response, next: NextFunction) => {
        req.user = user;
        return next();
      });
    sandbox.stub(prisma.user, "findUnique").resolves(user);
    sandbox.stub(prisma.user, "findMany").resolves([user]);
    sandbox.stub(prisma.user, "findFirst").resolves(user);
    sandbox.stub(prisma.user, "update").resolves(user);
    sandbox.stub(prisma.user, "delete").resolves(user);

    app = (await import("../src/index")).default;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("GET /user", () => {
    it("should return all users", () => {
      return async (resolve: () => void): Promise<void> => {
        chai
          .request(app)
          .get("/user")
          .set("authorization", "token")
          .end((_err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            resolve();
          });
      };
    });

    it("should return 500 on error", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox
          .stub(prisma.user, "findMany")
          .throws(new Error("Failed to fetch users"));

        app = (await import("../src/index")).default;

        chai
          .request(app)
          .get("/user")
          .end((_err, res) => {
            expect(res).to.have.status(500);
            expect(res.body)
              .to.have.property("error")
              .eql("Failed to fetch users");
            resolve();
          });
      };
    });
  });

  describe("GET /user/current", () => {
    it("should return current user", () => {
      return async (resolve: () => void): Promise<void> => {
        chai
          .request(app)
          .get("/user/current")
          .end((_err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            resolve();
          });
      };
    });

    it("should return 500 on error", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox
          .stub(prisma.user, "findFirst")
          .throws(new Error("Failed to fetch user"));

        app = (await import("../src/index")).default;

        chai
          .request(app)
          .get("/user/current")
          .end((_err, res) => {
            expect(res).to.have.status(500);
            expect(res.body)
              .to.have.property("error")
              .eql("Failed to fetch user");
            resolve();
          });
      };
    });
  });

  describe("GET /user/:id", () => {
    it("should return a user by ID", () => {
      return async (resolve: () => void): Promise<void> => {
        chai
          .request(app)
          .get("/user/66d6ef35dd3a1615cf637c75")
          .end((_err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            resolve();
          });
      };
    });

    it("should return 404 if user not found", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox.stub(prisma.user, "findUnique").resolves(null);

        app = (await import("../src/index")).default;

        chai
          .request(app)
          .get("/user/66d6ef35dd3a1615cf637c75")
          .end((_err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.have.property("error").eql("User not found");
            resolve();
          });
      };
    });

    it("should return 500 on error", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox
          .stub(prisma.user, "findUnique")
          .throws(new Error("Failed to fetch user"));

        app = (await import("../src/index")).default;

        chai
          .request(app)
          .get("/user/66d6ef35dd3a1615cf637c75")
          .end((_err, res) => {
            expect(res).to.have.status(500);
            expect(res.body)
              .to.have.property("error")
              .eql("Failed to fetch user");
            resolve();
          });
      };
    });
  });

  describe("PUT /user/:id", () => {
    it("should update a user by ID", () => {
      return async (resolve: () => void): Promise<void> => {
        chai
          .request(app)
          .put("/user/66d6ef35dd3a1615cf637c75")
          .send({ email: "newemail@example.com" })
          .end((_err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            resolve();
          });
      };
    });

    it("should return 500 on error", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox
          .stub(prisma.user, "update")
          .throws(new Error("Failed to update user"));

        app = (await import("../src/index")).default;

        chai
          .request(app)
          .put("/user/66d6ef35dd3a1615cf637c75")
          .send({ email: "newemail@example.com" })
          .end((_err, res) => {
            expect(res).to.have.status(500);
            expect(res.body)
              .to.have.property("error")
              .eql("Failed to update user");
            resolve();
          });
      };
    });
  });

  describe("POST /user/photo", () => {
    it("should upload a user photo", () => {
      return async (resolve: () => void): Promise<void> => {
        chai
          .request(app)
          .post("/user/photo")
          .send({ photo: "photoData" })
          .end((_err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            resolve();
          });
      };
    });

    it("should return 500 on error", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox
          .stub(prisma.user, "update")
          .throws(new Error("Failed to upload photo"));

        app = (await import("../src/index")).default;

        chai
          .request(app)
          .post("/user/photo")
          .send({ photo: "photoData" })
          .end((_err, res) => {
            expect(res).to.have.status(500);
            expect(res.body)
              .to.have.property("error")
              .eql("Failed to upload photo");
            resolve();
          });
      };
    });
  });

  describe("GET /user/photo/:id", () => {
    it("should return a user photo by ID", () => {
      return async (resolve: () => void): Promise<void> => {
        chai
          .request(app)
          .get("/user/photo/66d6ef35dd3a1615cf637c75")
          .end((_err, res) => {
            expect(res).to.have.status(200);
            resolve();
          });
      };
    });

    it("should return 404 if user not found", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox.stub(prisma.user, "findUnique").resolves(null);
        app = (await import("../src/index")).default;
        chai
          .request(app)
          .get("/user/photo/66d6ef35dd3a1615cf637c75")
          .end((_err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.have.property("error").eql("User not found");
            resolve();
          });
      };
    });

    it("should return 500 on error", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox
          .stub(prisma.user, "findUnique")
          .throws(new Error("Failed to fetch photo"));
        app = (await import("../src/index")).default;
        chai
          .request(app)
          .get("/user/photo/66d6ef35dd3a1615cf637c75")
          .end((_err, res) => {
            expect(res).to.have.status(500);
            expect(res.body)
              .to.have.property("error")
              .eql("Failed to fetch photo");
            resolve();
          });
      };
    });
  });

  describe("DELETE /user/:id", () => {
    it("should delete a user by ID", () => {
      return async (resolve: () => void): Promise<void> => {
        chai
          .request(app)
          .delete("/user/66d6ef35dd3a1615cf637c75")
          .end((_err, res) => {
            expect(res).to.have.status(200);
            expect(res.body)
              .to.have.property("message")
              .eql("User deleted successfully");
            resolve();
          });
      };
    });

    it("should return 500 on error", () => {
      return async (resolve: () => void): Promise<void> => {
        sandbox
          .stub(prisma.user, "delete")
          .throws(new Error("Failed to delete user"));
        app = (await import("../src/index")).default;

        chai
          .request(app)
          .delete("/user/66d6ef35dd3a1615cf637c75")
          .end((_err, res) => {
            expect(res).to.have.status(500);
            expect(res.body)
              .to.have.property("error")
              .eql("Failed to delete user");
            resolve();
          });
      };
    });
  });
});
