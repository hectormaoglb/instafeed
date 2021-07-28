import { promises } from "fs";
import validateArticle from "./validator/articleValidator.mjs";
import {
  init,
  saveValidArticle,
  saveInvalidArticle,
} from "./repo/articleRepo.mjs";
const articlePath = process.argv[2];
const validArticlePath = process.argv[3] || "./db.json";
const invalidArticlePath = process.argv[4] || "./invalid.json";

init({
  validPath: validArticlePath,
  invalidPath: invalidArticlePath,
});

const readArticleFile = async (path) => {
  const data = await promises.readFile(path);
  console.trace(`Article ${path} ... ${data}`);
  return JSON.parse(data);
};

const processArticle = async (articleFile) => {
  const article = await readArticleFile(articleFile);
  try {
    await validateArticle(article);
    await saveValidArticle(article);
    return article;
  } catch (error) {
    await saveInvalidArticle(article);
    throw error;
  }
};

const processArticles = async (path) => {
  const stat = await promises.lstat(path);
  let files = [];
  if (stat.isFile()) {
    files = [path];
  } else if (stat.isDirectory()) {
    const internalFiles = await promises.readdir(path);
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
