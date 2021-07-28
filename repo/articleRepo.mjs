import { promises } from "fs";

let opts = {
  validPath: "./db.json",
  invalidPath: "./invalid.json",
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
  console.debug("Write a valid article in ", opts.validPath);
  writeRecord(opts.validPath, article);
};

export const saveInvalidArticle = async (article) => {
  console.debug("Write an invalid article in ", opts.invalidPath);
  writeRecord(opts.invalidPath, article);
};
