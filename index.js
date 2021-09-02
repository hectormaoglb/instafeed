import { init as initArticleRepo } from "./repo/articleRepo.mjs";
import { init as initAuthorRepo } from "./repo/authorRepo.mjs";
import { init as initUserRepo } from "./repo/userRepo.mjs";
import { init as initCacheRepo } from "./cache/cacheRepo.mjs";

import { MongoClient } from "mongodb";

import { initWebService } from "./server/serverConfig.mjs";

import logger from "./logger/logger.mjs";

const port = parseInt(process.env["PORT"] || "8443");
const connectionString =
  process.env["CONECTION_STRING"] || "mongodb://127.0.0.1:27017";
const db = process.env["DATABASE"] || "instafeed";
const articleCollection = process.env["ARTICLE_COLLECTION"] || "articles";
const authorCollection = process.env["ARTICLE_COLLECTION"] || "authors";
const userCollection = process.env["ARTICLE_COLLECTION"] || "users";

const redisHost = process.env["REDIS_HOST"] || "127.0.0.1";
const redisPort = parseInt(process.env["REDIS_PORT"] || "6379");
const redisTtl = parseInt(process.env["REDIS_TTL"] || "3600");

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

  initCacheRepo({ host: redisHost, port: redisPort, ttl: redisTtl });

  await initWebService(port, secretKey);
};

start().then(
  () => logger.info("Instafeed service is Ready !!! 🚀"),
  (error) => logger.error("Service initialization error ❌", error)
);
