import chai from "chai";
import chaiHttp from "chai-http";
import app from "../src/index"; // Adjust the path to your Express app
import { describe, it, afterEach } from "mocha";
import sinon from "sinon";
import prisma from "../src/lib/db";
import authMiddleware from "../src/middlewares/authMiddleware";

chai.use(chaiHttp);
const { expect } = chai;
const sandbox = sinon.createSandbox();

describe("User Routes", () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe("GET /user", () => {
    it("should return all users", (done) => {
      sandbox.stub(prisma.user, "findFirst").resolves({
        id: "1",
        username: "user1",
        photo: null,
        email: "asd@asd.com",
        hash: "asdasd",
        apiToken: "token",
        role: "User",
      });

      sandbox.stub(prisma.user, "findMany").resolves([
        {
          id: "1",
          username: "user1",
          photo: null,
          email: "asd@asd.com",
          hash: "asdasd",
          apiToken: "token",
          role: "User",
        },
      ]);

      chai
        .request(app)
        .get("/user")
        .set("authorization", "token")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          done();
        });
    });

    it("should return 500 on error", (done) => {
      sandbox
        .stub(prisma.user, "findMany")
        .throws(new Error("Failed to fetch users"));
      chai
        .request(app)
        .get("/user")
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body)
            .to.have.property("error")
            .eql("Failed to fetch users");
          done();
        });
    });
  });

  describe("GET /user/current", () => {
    it("should return current user", (done) => {
      sandbox.stub(prisma.user, "findFirst").resolves({
        id: "1",
        username: "user1",
        photo: null,
        email: "user1@example.com",
        hash: "",
        apiToken: "",
        role: "User",
      });
      chai
        .request(app)
        .get("/user/current")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          done();
        });
    });

    it("should return 500 on error", (done) => {
      sandbox
        .stub(prisma.user, "findFirst")
        .throws(new Error("Failed to fetch user"));
      chai
        .request(app)
        .get("/user/current")
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body)
            .to.have.property("error")
            .eql("Failed to fetch user");
          done();
        });
    });
  });

  describe("GET /user/:id", () => {
    it("should return a user by ID", (done) => {
      sandbox.stub(prisma.user, "findUnique").resolves({
        id: "1",
        username: "user1",
        photo: null,
        email: "user1@example.com",
        hash: "",
        apiToken: "",
        role: "User",
      });
      chai
        .request(app)
        .get("/user/1")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          done();
        });
    });

    it("should return 404 if user not found", (done) => {
      sandbox.stub(prisma.user, "findUnique").resolves(null);
      chai
        .request(app)
        .get("/user/1")
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("error").eql("User not found");
          done();
        });
    });

    it("should return 500 on error", (done) => {
      sandbox
        .stub(prisma.user, "findUnique")
        .throws(new Error("Failed to fetch user"));
      chai
        .request(app)
        .get("/user/1")
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body)
            .to.have.property("error")
            .eql("Failed to fetch user");
          done();
        });
    });
  });

  describe("PUT /user/:id", () => {
    it("should update a user by ID", (done) => {
      sandbox.stub(prisma.user, "update").resolves({
        id: "1",
        username: "user1",
        photo: null,
        email: "newemail@example.com",
        hash: "",
        apiToken: "",
        role: "User",
      });
      chai
        .request(app)
        .put("/user/1")
        .send({ email: "newemail@example.com" })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          done();
        });
    });

    it("should return 500 on error", (done) => {
      sandbox
        .stub(prisma.user, "update")
        .throws(new Error("Failed to update user"));
      chai
        .request(app)
        .put("/user/1")
        .send({ email: "newemail@example.com" })
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body)
            .to.have.property("error")
            .eql("Failed to update user");
          done();
        });
    });
  });

  describe("POST /user/photo", () => {
    it("should upload a user photo", (done) => {
      sandbox.stub(prisma.user, "update").resolves({
        id: "1",
        username: "user1",
        photo: "photoData",
        email: "user1@example.com",
        hash: "",
        apiToken: "",
        role: "User",
      });
      chai
        .request(app)
        .post("/user/photo")
        .send({ photo: "photoData" })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          done();
        });
    });

    it("should return 500 on error", (done) => {
      sandbox
        .stub(prisma.user, "update")
        .throws(new Error("Failed to upload photo"));
      chai
        .request(app)
        .post("/user/photo")
        .send({ photo: "photoData" })
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body)
            .to.have.property("error")
            .eql("Failed to upload photo");
          done();
        });
    });
  });

  describe("GET /user/photo/:id", () => {
    it("should return a user photo by ID", (done) => {
      sandbox.stub(prisma.user, "findUnique").resolves({
        id: "1",
        username: "user1",
        photo: "photoData",
        email: "user1@example.com",
        hash: "",
        apiToken: "",
        role: "User",
      });
      chai
        .request(app)
        .get("/user/photo/1")
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it("should return 404 if user not found", (done) => {
      sandbox.stub(prisma.user, "findUnique").resolves(null);
      chai
        .request(app)
        .get("/user/photo/1")
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("error").eql("User not found");
          done();
        });
    });

    it("should return 500 on error", (done) => {
      sandbox
        .stub(prisma.user, "findUnique")
        .throws(new Error("Failed to fetch photo"));
      chai
        .request(app)
        .get("/user/photo/1")
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body)
            .to.have.property("error")
            .eql("Failed to fetch photo");
          done();
        });
    });
  });

  describe("DELETE /user/:id", () => {
    it("should delete a user by ID", (done) => {
      sandbox.stub(prisma.user, "delete").resolves({
        id: "1",
        username: "user1",
        photo: null,
        email: "user1@example.com",
        hash: "",
        apiToken: "",
        role: "User",
      });
      chai
        .request(app)
        .delete("/user/1")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body)
            .to.have.property("message")
            .eql("User deleted successfully");
          done();
        });
    });

    it("should return 500 on error", (done) => {
      sandbox
        .stub(prisma.user, "delete")
        .throws(new Error("Failed to delete user"));
      chai
        .request(app)
        .delete("/user/1")
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body)
            .to.have.property("error")
            .eql("Failed to delete user");
          done();
        });
    });
  });
});
