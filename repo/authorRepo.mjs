import { ReturnDocument } from "mongodb";

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
  console.log(
    `Insert / Update Author ${author.id} result: ${JSON.stringify(result)}`
  );
  return result.value;
};

export const findAll = async () => {
  return authorCollection.find().toArray();
};

export const findById = async (id) => {
  return await authorCollection.findOne({ id });
};

export const deleteById = async (id) => {
  const result = await authorCollection.findOneAndDelete({ id });
  return result.value;
};

export const updateById = async (id, fields) => {
  const result = await authorCollection.findOneAndUpdate(
    { id },
    { $set: fields },
    { returnDocument: ReturnDocument.AFTER }
  );
  return result.value;
};
