import { ReturnDocument } from "mongodb";
import { ServiceException } from "../exc/serviceException.mjs";

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
  console.log(
    `Insert / Update Article ${article.id} result: ${JSON.stringify(result)}`
  );
  return result.value;
};

export const findAll = async () => {
  return articleCollection.find().toArray();
};

export const findById = async (id) => {
  return await articleCollection.findOne({ id });
};

export const deleteById = async (id) => {
  const result = await articleCollection.findOneAndDelete({ id });
  return result.value;
};

export const deleteByAuthor = async (authorId) => {
  const result = await articleCollection.deleteMany({ author: authorId });
  return result.value;
};

export const updateById = async (id, fields) => {
  const result = await articleCollection.findOneAndUpdate(
    { id },
    { $set: fields },
    { returnDocument: ReturnDocument.AFTER }
  );
  return result.value;
};
