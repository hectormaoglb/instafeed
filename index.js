import { init as initArticleRepo } from "./repo/articleRepo.mjs";
import { init as initAuthorRepo } from "./repo/authorRepo.mjs";
import { init as initUserRepo } from "./repo/userRepo.mjs";

import { MongoClient } from "mongodb";

import { initWebService } from "./server/serverConfig.mjs";

import logger from "./logger/logger.mjs";

const port = parseInt(process.argv[2] || "8443");
const connectionString = process.argv[3] || "mongodb://127.0.0.1:27017";
const db = process.argv[4] || "instafeed";
const articleCollection = process.argv[5] || "articles";
const authorCollection = process.argv[6] || "authors";
const userCollection = process.argv[6] || "users";

const secretKey = "INSTAFEED_TOP_SECRET";

const start = async () => {
  const client = new MongoClient(connectionString);
  await client.connect();
  initArticleRepo({
    client,
    db,
    collection: articleCollection,
  });
  initAuthorRepo({
    client,
    db,
    collection: authorCollection,
  });
  initUserRepo({
    client,
    db,
    collection: userCollection,
  });
  await initWebService(port, secretKey);
};

start().then(
  () => logger.info("Instafeed service is Ready !!! 🚀"),
  (error) => logger.error("Service initialization error ❌", error)
);
