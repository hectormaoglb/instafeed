import { MongoClient } from "mongodb";
import { ServiceException } from "../exc/serviceException.mjs";

let opts = {
  connectionString: "mongodb://127.0.0.1:27017",
  db: "instafeed",
  collection: "articles",
};

let articleCollection = null;

export const init = async (newOpts) => {
  opts = {
    ...opts,
    ...newOpts,
  };
  const client = new MongoClient(opts.connectionString);
  await client.connect();
  const db = client.db(opts.db);
  articleCollection = db.collection(opts.collection);
};

export const saveValidArticle = async (article) => {
  const result = await articleCollection.updateOne(
    { id: article.id },
    { $set: article },
    {
      upsert: true,
    }
  );
  console.log(
    `Insert / Update Article ${article.id} result: ${JSON.stringify(result)}`
  );
  return true;
};

export const findAll = async () => {
  return articleCollection.find().toArray();
};

export const findById = async (id) => {
  return await articleCollection.findOne({ id });
};
