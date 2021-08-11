import express from "express";
import {
  getAllArticles,
  getArticleById,
  saveArticle,
  deleteArticle,
  updateArticle,
} from "./serv/articleService.mjs";

import { init as initRepo } from "./repo/articleRepo.mjs";

import bodyParser from "body-parser";

const port = parseInt(process.argv[2] || "8080");
const connectionString = process.argv[3] || "mongodb://127.0.0.1:27017";
const db = process.argv[4] || "instafeed";
const collection = process.argv[5] || "articles";

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

const initWebService = () => {
  const app = express();

  app.use(bodyParser.json());

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

  app.listen(port, () => {
    console.log(`Instafeed app listening 🏁 at http://localhost:${port}`);
  });
};

initRepo({ connectionString, db, collection }).then(
  (data) => {
    initWebService();
  },
  (error) => console.error("Service initialization error ❌", error)
);
