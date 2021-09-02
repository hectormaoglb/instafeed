import { ReturnDocument } from "mongodb";
import logger from "../logger/logger.mjs";

let opts = {
  client: null,
  db: "instafeed",
  collection: "articles",
};

let articleCollection = null;

export const init = (newOpts) => {
  opts = {
    ...opts,
    ...newOpts,
  };

  const db = opts.client.db(opts.db);
  articleCollection = db.collection(opts.collection);
};

export const saveValidArticle = async (article) => {
  const result = await articleCollection.findOneAndUpdate(
    { id: article.id },
    { $set: article },
    {
      upsert: true,
      returnDocument: ReturnDocument.AFTER,
    }
  );
  logger.info(`Insert / Update Article ${article.id}`, { result });
  return result.value;
};

export const findAll = async () => {
  logger.info(`Find all articles`);
  return articleCollection.find().toArray();
};

export const findById = async (id) => {
  logger.info(`Find article by id ${id}`);
  return await articleCollection.findOne({ id });
};

export const deleteById = async (id) => {
  logger.info(`Delete article by id ${id}`);
  const result = await articleCollection.findOneAndDelete({ id });
  return result.value;
};

export const deleteByAuthor = async (authorId) => {
  logger.info(`Delete article by author ${authorId}`);
  const result = await articleCollection.deleteMany({ author: authorId });
  return result.value;
};

export const updateById = async (id, fields) => {
  logger.info(`Delete article by author ${authorId}`);
  const result = await articleCollection.findOneAndUpdate(
    { id },
    { $set: fields },
    { returnDocument: ReturnDocument.AFTER }
  );
  return result.value;
};
