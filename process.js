const fs = require("fs");
const util = require("util");
const validateArticle = require("./validator/articleValidator");
const readFile = util.promisify(fs.readFile);
const articlePath = process.argv[2];

const readArticle = async (path) => {
  const data = await readFile(path);
  console.log("Getting file content: " + data);
  return JSON.parse(data);
};

const processArticle = async () => {
  const article = await readArticle(articlePath);
  await validateArticle(article);
  return article;
};

processArticle().then(
  (data) => console.debug("Article is Valid 😃"),
  (err) => console.error("Invalid Article 😭", err)
);
