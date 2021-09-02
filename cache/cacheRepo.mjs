import redis from "redis";
import logger from "../logger/logger.mjs";
import { promisify } from "util";

let opts = {
  host: "127.0.0.1",
  port: 6379,
  ttl: 3600,
};

let getAsync;
let setAsync;

export const init = (newOpts) => {
  opts = {
    ...opts,
    ...newOpts,
  };
  const client = redis.createClient(opts);

  client.on("error", (error) => {
    logger.error("Redis Error ☠️", error);
  });

  getAsync = promisify(client.get).bind(client);
  setAsync = promisify(client.setex).bind(client);

  logger.info("Redis Cache initialized");
};

export const getCache = async (key) => {
  const response = await getAsync(key);
  if (response) {
    return JSON.parse(response);
  } else {
    return null;
  }
};

export const setCache = async (key, obj) => {
  await setAsync(key, opts.ttl, JSON.stringify(obj));
};
