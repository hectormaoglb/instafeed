import { ReturnDocument } from "mongodb";
import logger from "../logger/logger.mjs";

let opts = {
  client: null,
  db: "instafeed",
  collection: "users",
};

let userCollection = null;

export const init = (newOpts) => {
  opts = {
    ...opts,
    ...newOpts,
  };

  const db = opts.client.db(opts.db);
  userCollection = db.collection(opts.collection);
};

export const saveUser = async (user) => {
  const result = await userCollection.findOneAndUpdate(
    { login: user.login },
    { $set: user },
    {
      upsert: true,
      returnDocument: ReturnDocument.AFTER,
    }
  );
  logger.log(
    `Insert / Update user ${user.login} result: ${JSON.stringify(result)}`
  );
  return result.value;
};

export const findAll = async () => {
  logger.info(`Find all users`);
  return userCollection.find().toArray();
};

export const findById = async (login) => {
  logger.info(`Find user by login ${login}`);
  return await userCollection.findOne({ login });
};

export const deleteById = async (login) => {
  logger.info(`Delete user by login ${login}`);
  const result = await userCollection.findOneAndDelete({ login });
  return result.value;
};

export const updateById = async (login, fields) => {
  logger.info(`Update user by login ${login}`, fields);
  const result = await userCollection.findOneAndUpdate(
    { login },
    { $set: fields },
    { returnDocument: ReturnDocument.AFTER }
  );
  return result.value;
};
