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

import { init as initArticleRepo } from "./repo/articleRepo.mjs";
import { init as initAuthorRepo } from "./repo/authorRepo.mjs";

import bodyParser from "body-parser";
import { MongoClient } from "mongodb";

import cors from "cors";

import helmet from "helmet";

const port = parseInt(process.argv[2] || "8080");
const connectionString = process.argv[3] || "mongodb://127.0.0.1:27017";
const db = process.argv[4] || "instafeed";
const articleCollection = process.argv[5] || "articles";
const authorCollection = process.argv[6] || "authors";

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

const setArticleRoutes = (app) => {
  app.get("/articles", async (req, res) =>
    executeOperation(async () => getAllArticles(), res)
  );

  app.post("/articles", async (req, res) =>
    executeOperation(
      async () => {
        const newArticle = req.body;
        return saveArticle(newArticle);
      },
      res,
      201
    )
  );

  app.get("/articles/:articleId", async (req, res) =>
    executeOperation(async () => {
      const { articleId } = req.params;
      return getArticleById(articleId);
    }, res)
  );

  app.delete("/articles/:articleId", async (req, res) =>
    executeOperation(async () => {
      const { articleId } = req.params;
      return deleteArticle(articleId);
    }, res)
  );
  app.put("/articles/:articleId", async (req, res) =>
    executeOperation(async () => {
      const { articleId } = req.params;
      const article = { ...req.body, id: articleId };
      return updateArticle(articleId, article, true);
    }, res)
  );
  app.patch("/articles/:articleId", async (req, res) =>
    executeOperation(async () => {
      const { articleId } = req.params;
      const article = req.body;
      return updateArticle(articleId, article, false);
    }, res)
  );
};

const setAuthorRoutes = (app) => {
  app.get("/authors", async (req, res) =>
    executeOperation(async () => getAllAuthors(), res)
  );

  app.post("/authors", async (req, res) =>
    executeOperation(
      async () => {
        const newAuthor = req.body;
        return saveAuthor(newAuthor);
      },
      res,
      201
    )
  );

  app.get("/authors/:authorId", async (req, res) =>
    executeOperation(async () => {
      const { authorId } = req.params;
      return getAuthorById(authorId);
    }, res)
  );

  app.delete("/authors/:authorId", async (req, res) =>
    executeOperation(async () => {
      const { authorId } = req.params;
      return deleteAuthor(authorId);
    }, res)
  );
  app.put("/authors/:authorId", async (req, res) =>
    executeOperation(async () => {
      const { authorId } = req.params;
      return updateAuthor(authorId, req.body);
    }, res)
  );
};

const initWebService = () => {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors());
  app.use(helmet());

  setArticleRoutes(app);
  setAuthorRoutes(app);

  app.listen(port, () => {
    console.log(`Instafeed app listening 🏁 at http://localhost:${port}`);
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
  initWebService();
};

start().then(
  () => console.log("Instafeed service is Ready !!! 🚀"),
  (error) => console.error("Service initialization error ❌", error)
);
