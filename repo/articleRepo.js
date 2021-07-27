const fs = require("fs");

let opts = {
  validPath: "./db.json",
  invalidPath: "./invalid.json",
};

const init = (newOpts) => {
  opts = {
    ...opts,
    ...newOpts,
  };
};

const writeRecord = async (path, record) => {
  fs.promises.writeFile(path, JSON.stringify(record) + "\n", { flag: "a" });
};

const saveValidArticle = async (article) => {
  console.debug("Write a valid article in ", opts.validPath);
  writeRecord(opts.validPath, article);
};

const saveInvalidArticle = async (article) => {
  console.debug("Write an invalid article in ", opts.invalidPath);
  writeRecord(opts.invalidPath, article);
};

module.exports = {
  init,
  saveValidArticle,
  saveInvalidArticle,
};
