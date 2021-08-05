import express from "express";
import {
  init,
  getAllArticles,
  getArticleById,
  saveArticle,
} from "./serv/articleService.mjs";

import bodyParser from "body-parser";

const port = parseInt(process.argv[2] || "8080");
const validArticlePath = process.argv[3] || "./db.json";
const invalidArticlePath = process.argv[4] || "./invalid.json";

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

init(validArticlePath, invalidArticlePath).then(
  (data) => console.log("Service Ready ✅"),
  (error) => console.error("Service initialization error ❌", error)
);

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
    replyWithResult(newArticle, res);
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
