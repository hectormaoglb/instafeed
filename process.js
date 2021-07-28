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

const readArticleFile = async (path) => {
  const data = await fs.promises.readFile(path);
  console.trace("Getting file content: " + data);
  return JSON.parse(data);
};

const processArticle = async (articleFile) => {
  const article = await readArticleFile(articleFile);
  try {
    await validateArticle(article);
    await articleRepo.saveValidArticle(article);
    return article;
  } catch (error) {
    await articleRepo.saveInvalidArticle(article);
    throw error;
  }
};

const processArticles = async (path) => {
  const stat = await fs.promises.lstat(path);
  let files = [];
  if (stat.isFile()) {
    files = [path];
  } else if (stat.isDirectory()) {
    const internalFiles = await fs.promises.readdir(path);
    files = internalFiles
      .filter((file) => !file.startsWith(".") && file.endsWith(".json"))
      .map((file) => `${path}/${file}`);
  }

  return Promise.all(
    files.map(async (file) => {
      try {
        await processArticle(file);
        console.debug(`Valid Article ${file} 😃`);
      } catch (error) {
        console.error(`Invalid Article ${file} 😭`, error);
      }
    })
  );
};

processArticles(articlePath).then(
  (data) => console.log("Process is finished 🏁"),
  (err) => console.error("Unexpected Error 🐞", err)
);
