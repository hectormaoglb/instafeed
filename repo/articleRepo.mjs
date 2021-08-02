import { promises, createReadStream } from "fs";
import readline from "readline";

let opts = {
  validPath: "./db.json",
  invalidPath: "./invalid.json",
};

let articles = [];
let articlesById = {};

const articleExists = (article) => {
  return article.id in articlesById;
};

export const loadArticles = async () => {
  const input = createReadStream(opts.validPath);
  const read = readline.createInterface({
    input,
    terminal: false,
  });

  return new Promise((resolve, reject) => {
    input.on("close", () => {
      read.close();
      resolve();
    });

    read.on("line", (line) => {
      const article = JSON.parse(line);
      if (!articleExists(article)) {
        addArticle(article);
      }
    });
  });
};

export const addArticle = async (article) => {
  articles = [...articles, article];
  articlesById = {
    ...articlesById,
    [article.id]: article,
  };
};

export const init = (newOpts) => {
  opts = {
    ...opts,
    ...newOpts,
  };
};

const writeRecord = async (path, record) => {
  promises.writeFile(path, JSON.stringify(record) + "\n", { flag: "a" });
};

export const saveValidArticle = async (article) => {
  if (!articleExists(article)) {
    console.debug("Write a valid article in ", opts.validPath);
    await writeRecord(opts.validPath, article);
    addArticle();
  } else {
    console.error(`Duplicated Article ${article.id}`);
  }
};

export const saveInvalidArticle = async (article) => {
  console.debug("Write an invalid article in ", opts.invalidPath);
  writeRecord(opts.invalidPath, article);
};

export const findAll = async () => {
  return articles;
};

export const findById = async (id) => {
  return articlesById[id];
};
