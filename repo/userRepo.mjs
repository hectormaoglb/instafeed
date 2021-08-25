import { ReturnDocument } from "mongodb";

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
  console.log(
    `Insert / Update user ${user.login} result: ${JSON.stringify(result)}`
  );
  return result.value;
};

export const findAll = async () => {
  return userCollection.find().toArray();
};

export const findById = async (login) => {
  return await userCollection.findOne({ login });
};

export const deleteById = async (login) => {
  const result = await userCollection.findOneAndDelete({ login });
  return result.value;
};

export const updateById = async (login, fields) => {
  const result = await userCollection.findOneAndUpdate(
    { login },
    { $set: fields },
    { returnDocument: ReturnDocument.AFTER }
  );
  return result.value;
};
