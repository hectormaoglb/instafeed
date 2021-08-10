import express from "express";
import {
  getAllArticles,
  getArticleById,
  saveArticle,
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
  res.status(status);
  res.send(JSON.stringify(payload));
};

const replyWithResult = (result, res) => {
  reply(200, result, res);
};

const replyWithError = (error, res) => {
  console.error(`Error processing request: ${error.message} ❌`, error);
  const payload = buildError(error);
  reply(payload.status, payload, res);
};

const initWebService = () => {
  const app = express();

  app.use(bodyParser.json());

  app.get("/articles", async (req, res) => {
    res.header("Content-Type", "application/json");
    try {
      const result = await getAllArticles();
      replyWithResult(result, res);
    } catch (error) {
      replyWithError(error, res);
    }
  });

  app.post("/articles", async (req, res) => {
    const newArticle = req.body;
    res.header("Content-Type", "application/json");
    try {
      await saveArticle(newArticle);
      reply(201, newArticle, res);
    } catch (error) {
      replyWithError(error, res);
    }
  });

  app.get("/articles/:articleId", async (req, res) => {
    res.header("Content-Type", "application/json");
    try {
      const { articleId } = req.params;
      const result = await getArticleById(articleId);
      replyWithResult(result, res);
    } catch (error) {
      replyWithError(error, res);
    }
  });

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
