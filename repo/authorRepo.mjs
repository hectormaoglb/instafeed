import { ReturnDocument } from "mongodb";
import logger from "../logger/logger.mjs";

let opts = {
  client: null,
  db: "instafeed",
  collection: "authors",
};

let authorCollection = null;

export const init = (newOpts) => {
  opts = {
    ...opts,
    ...newOpts,
  };

  const db = opts.client.db(opts.db);
  authorCollection = db.collection(opts.collection);
};

export const saveAuthor = async (author) => {
  const result = await authorCollection.findOneAndUpdate(
    { id: author.id },
    { $set: author },
    {
      upsert: true,
      returnDocument: ReturnDocument.AFTER,
    }
  );
  logger.info(`Insert / Update Author ${author.id}`, { result });
  return result.value;
};

export const addArticle = async (authorId, articleId) => {
  logger.info(`Add article ${articleId} to author ${authorId}`);
  const result = await authorCollection.findOneAndUpdate(
    { $and: [{ id: authorId }, { articles: { $ne: articleId } }] },
    { $push: { articles: articleId } },
    {
      upsert: true,
      returnDocument: ReturnDocument.AFTER,
    }
  );
  console.log(`Add Article ${articleId} to author ${authorId}`);
  return result.value;
};

export const delArticle = async (authorId, articleId) => {
  logger.info(`Delete article ${articleId} to author ${authorId}`);
  const result = await authorCollection.findOneAndUpdate(
    { $and: [{ id: authorId }, { articles: articleId }] },
    { $pull: { articles: articleId } },
    {
      upsert: true,
      returnDocument: ReturnDocument.AFTER,
    }
  );
  console.log(`Remove Article ${articleId} from author ${authorId}`);
  return result.value;
};

export const findAll = async () => {
  logger.info(`Find all Authors`);
  return authorCollection.find().toArray();
};

export const findById = async (id) => {
  logger.info(`Find Author by id ${id}`);
  return await authorCollection.findOne({ id });
};

export const deleteById = async (id) => {
  logger.info(`Delete Author by id ${id}`);
  const result = await authorCollection.findOneAndDelete({ id });
  return result.value;
};

export const updateById = async (id, fields) => {
  logger.info(`Update Author by id ${id}`, { fields });
  const result = await authorCollection.findOneAndUpdate(
    { id },
    { $set: fields },
    { returnDocument: ReturnDocument.AFTER }
  );
  return result.value;
};
