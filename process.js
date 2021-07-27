const fs = require("fs");
const validateArticle = require("./validator/articleValidator");
const articleRepo = require("./repo/articleRepo");
const articlePath = process.argv[2];
const validArticlePath = process.argv[3] || "./db.json";
const invalidArticlePath = process.argv[4] || "./invalid.json";

articleRepo.init({
  validPath: validArticlePath,
  invalidPath: invalidArticlePath,
});

const readArticle = async (path) => {
  const data = await fs.promises.readFile(articlePath);
  console.log("Getting file content: " + data);
  return JSON.parse(data);
};

const processArticle = async () => {
  const article = await readArticle(articlePath);
  try {
    await validateArticle(article);
    await articleRepo.saveValidArticle(article);
    return article;
  } catch (error) {
    await articleRepo.saveInvalidArticle(article);
    throw error;
  }
};

processArticle().then(
  (data) => console.debug("Article is Valid 😃"),
  (err) => console.error("Invalid Article 😭", err)
);
