import express from "express";
import {
  getAllArticles,
  getArticleById,
  saveArticle,
  deleteArticle,
  updateArticle,
} from "./serv/articleService.mjs";

import {
  getAllAuthors,
  getAuthorById,
  saveAuthor,
  deleteAuthor,
  updateAuthor,
} from "./serv/authorService.mjs";

import {
  getAllUsers,
  getUserById,
  saveUser,
  deleteUser,
  updateUser,
  login,
} from "./serv/userService.mjs";

import { init as initArticleRepo } from "./repo/articleRepo.mjs";
import { init as initAuthorRepo } from "./repo/authorRepo.mjs";
import { init as initUserRepo } from "./repo/userRepo.mjs";

import bodyParser from "body-parser";
import { MongoClient } from "mongodb";

import cors from "cors";

import helmet from "helmet";

import fs from "fs/promises";
import https from "https";

import passport from "passport";

import { BasicStrategy } from "passport-http";

import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";

import jwt from "jsonwebtoken";
import { ServiceException } from "./exc/serviceException.mjs";

const port = parseInt(process.argv[2] || "8443");
const connectionString = process.argv[3] || "mongodb://127.0.0.1:27017";
const db = process.argv[4] || "instafeed";
const articleCollection = process.argv[5] || "articles";
const authorCollection = process.argv[6] || "authors";
const userCollection = process.argv[6] || "users";

const secretKey = "INSTAFEED_TOP_SECRET";

const buildError = (error) => ({
  status: error.status || 500,
  message: error.message,
  error,
});

const reply = (status, payload, res) => {
  res.header("Content-Type", "application/json");
  res.status(status);
  res.send(JSON.stringify(payload));
};

const replyWithError = (error, res) => {
  console.error(`Error processing request: ${error.message} ❌`, error);
  const payload = buildError(error);
  reply(payload.status, payload, res);
};

const executeOperation = async (callServiceSupplier, res, okStatus) => {
  try {
    const result = await callServiceSupplier();
    const status = okStatus || 200;
    reply(status, result, res);
  } catch (error) {
    replyWithError(error, res);
  }
};

const executeAdminTask = (supplier, res) =>
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return replyWithError(err, res);
    }

    if (!user) {
      return replyWithError(
        new ServiceException(401, "Unauthorized User"),
        res
      );
    }

    if (!user.roles.includes("admin")) {
      return replyWithError(
        new ServiceException(401, "Unauthorized User"),
        res
      );
    }
    executeOperation(supplier, res);
  });

const setArticleRoutes = (app) => {
  const articleBasePath = "/articles";
  const articleIdPath = `${articleBasePath}/:articleId`;

  app.get(articleBasePath, async (req, res) =>
    executeOperation(async () => getAllArticles(), res)
  );

  app.post(
    articleBasePath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeOperation(
        async () => {
          const newArticle = req.body;
          return saveArticle(newArticle);
        },
        res,
        201
      )
  );

  app.get(`${articleBasePath}/:articleId`, async (req, res) =>
    executeOperation(async () => {
      const { articleId } = req.params;
      return getArticleById(articleId);
    }, res)
  );

  app.delete(articleIdPath, async (req, res) =>
    executeAdminTask(async () => {
      const { articleId } = req.params;
      return deleteArticle(articleId);
    }, res)(req, res)
  );
  app.put(
    articleIdPath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeOperation(async () => {
        const { articleId } = req.params;
        const article = { ...req.body, id: articleId };
        return updateArticle(articleId, article, true);
      }, res)
  );
  app.patch(
    articleIdPath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeOperation(async () => {
        const { articleId } = req.params;
        const article = req.body;
        return updateArticle(articleId, article, false);
      }, res)
  );
};

const setAuthorRoutes = (app) => {
  const authorBasePath = "/authors";
  const authorIdPath = `${authorBasePath}/:authorId`;

  app.get(authorBasePath, async (req, res) =>
    executeOperation(async () => getAllAuthors(), res)
  );

  app.post(
    authorBasePath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeOperation(
        async () => {
          const newAuthor = req.body;
          return saveAuthor(newAuthor);
        },
        res,
        201
      )
  );

  app.get(authorIdPath, async (req, res) =>
    executeOperation(async () => {
      const { authorId } = req.params;
      return getAuthorById(authorId);
    }, res)
  );

  app.delete(
    authorIdPath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeAdminTask(async () => {
        const { authorId } = req.params;
        return deleteAuthor(authorId);
      }, res)(req, res)
  );
  app.put(
    authorIdPath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeOperation(async () => {
        const { authorId } = req.params;
        return updateAuthor(authorId, req.body);
      }, res)
  );
};

const setUserRoutes = (app) => {
  const userBasePath = "/users";
  const userIdPath = `${userBasePath}/:userId`;

  app.get(userBasePath, async (req, res) =>
    executeOperation(async () => getAllUsers(), res)
  );

  app.post(
    userBasePath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeOperation(
        async () => {
          const newUser = req.body;
          return saveUser(newUser);
        },
        res,
        201
      )
  );

  app.get(userIdPath, async (req, res) =>
    executeOperation(async () => {
      const { userId } = req.params;
      return getUserById(userId);
    }, res)
  );

  app.delete(
    userIdPath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeAdminTask(async () => {
        const { userId } = req.params;
        return deleteUser(userId);
      }, res)(req, res)
  );
  app.put(
    userIdPath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeOperation(async () => {
        const { userId } = req.params;
        return updateUser(userId, req.body);
      }, res)
  );
};

const setSessionRoutes = (app) => {
  app.post(
    "/session",
    passport.authenticate("basic", { session: false }),
    async (req, res) =>
      executeOperation(async () => {
        const user = req.user;
        const body = { login: user.login, roles: user.roles };
        const token = jwt.sign({ user: body }, secretKey, { expiresIn: "1h" });
        return { token };
      }, res)
  );
};

const initWebService = async () => {
  const app = express();

  passport.use(
    new BasicStrategy(async (username, password, done) => {
      const user = await login(username, password);
      if (!user) {
        return done(null, false, { message: "Invalid user or password" });
      }
      return done(null, user);
    })
  );

  passport.use(
    new JWTStrategy(
      {
        secretOrKey: secretKey,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
      },
      async (token, done) => {
        const user = await getUserById(token.user.login);
        if (!user) {
          return done(null, false, {
            message: `User ${token.user.login} not found`,
          });
        }
        return done(null, user);
      }
    )
  );

  const key = await fs.readFile("./cert/server.key");
  const cert = await fs.readFile("./cert/server.cert");

  app.use(bodyParser.json());
  app.use(cors());
  app.use(helmet());

  setArticleRoutes(app);
  setAuthorRoutes(app);
  setUserRoutes(app);
  setSessionRoutes(app);

  https
    .createServer(
      {
        key,
        cert,
      },
      app
    )
    .listen(port, () => {
      console.log(`Instafeed app listening 🏁 at https://localhost:${port}`);
    });
};

const start = async () => {
  const client = new MongoClient(connectionString);
  await client.connect();
  initArticleRepo({
    client,
    db,
    collection: articleCollection,
  });
  initAuthorRepo({
    client,
    db,
    collection: authorCollection,
  });
  initUserRepo({
    client,
    db,
    collection: userCollection,
  });
  await initWebService();
};

start().then(
  () => console.log("Instafeed service is Ready !!! 🚀"),
  (error) => console.error("Service initialization error ❌", error)
);
