import express from "express";
import request from "supertest";
import fs from "fs";
import { setArticleRoutes } from "../../../routes/articleRoute.mjs";
import { ServiceException as MockServiceException } from "../../../exc/serviceException.mjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";

const testUser = { login: "testUser", roles: ["admin", "test"] };
const secretKey = "InstafeedTestSecretKey";

const token = jwt.sign({ user: testUser }, secretKey, { expiresIn: "1h" });

const mockArticle = JSON.parse(
  fs.readFileSync("./test/fixtures/validArticle.json")
);

jest.mock("../../../serv/articleService.mjs", () => {
  return {
    getAllArticles: async () => [mockArticle],
    getArticleById: async (id) => {
      if (id === "validId") {
        return mockArticle;
      } else {
        throw new MockServiceException(400, "Test Error");
      }
    },
    saveArticle: async (article) => article,
    updateArticle: async (id, article, complete) => article,
    deleteArticle: async (articleId) => mockArticle,
  };
});

passport.use(
  new JWTStrategy(
    {
      secretOrKey: secretKey,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
    },
    async (token, done) => {
      return done(null, testUser);
    }
  )
);

describe("Article Routes Test", () => {
  let app;
  let article;

  beforeAll(async () => {
    app = express();
    setArticleRoutes(app);
  });

  it("Get Articles Successfully", (done) => {
    request(app).get("/articles").expect(200, done);
  });

  it("Get Article By Id Successfully", (done) => {
    request(app).get("/articles/validId").expect(200, done);
  });

  it("Get Article By Id Failed", (done) => {
    request(app).get("/articles/invalidId").expect(400, done);
  });

  it("Create Article Successfully", (done) => {
    request(app)
      .post("/articles")
      .set("Authorization", "Bearer " + token)
      .send(mockArticle)
      .expect(201, done);
  });

  it("Update Article Successfully", (done) => {
    request(app)
      .put("/articles/testArticle")
      .set("Authorization", "Bearer " + token)
      .send(mockArticle)
      .expect(200, done);
  });

  it("Partial Update Article Successfully", (done) => {
    request(app)
      .patch("/articles/testArticle")
      .set("Authorization", "Bearer " + token)
      .send(mockArticle)
      .expect(200, done);
  });

  it("Delete Article Successfully", (done) => {
    request(app)
      .delete("/articles/testArticle")
      .set("Authorization", "Bearer " + token)
      .send(mockArticle)
      .expect(200, done);
  });
});
