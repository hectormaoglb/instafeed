const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);
const articlePath = process.argv[2];

const readArticle = async (path) => {
  const data = await readFile(path);
  console.log("Getting file content: " + data);
  return JSON.parse(data);
};

const validateString = async (field, value, required, regExp, min, max) => {
  if (!required && !value) {
    return true;
  }

  if (required && !value) {
    throw new Error(`${field} is required`);
  }

  if (typeof value !== "string") {
    throw new Error(`${field} must be a string`);
  }

  if (regExp && value.match(regExp) == null) {
    throw new Error(`${field} has invalid format`);
  }

  if (min && value.length < min) {
    throw new Error(`${field} doesn't have the min length`);
  }

  if (max && value.length > max) {
    throw new Error(`${field} doesn't have the max length`);
  }

  return true;
};

const validateDate = async (field, value, required, isPast, isFuture) => {
  if (!required && !value) {
    return true;
  }

  await validateString(field, value, required, /^\d{2}\/\d{2}\/\d{4}$/);
  const dateValue = new Date(value);
  const now = new Date();
  if (isPast && dateValue > now) {
    throw new Error(`${field} must be a date in past`);
  }

  if (isFuture && dateValue < now) {
    throw new Error(`${field} must be a date in future`);
  }

  return true;
};

const validateNumber = async (field, value, required, min, max) => {
  if (!required && !value) {
    return true;
  }
  if (typeof value !== "number") {
    throw new Error(`${field} must be a number`);
  }

  if (min && value < min) {
    throw new Error(`${field} invalid min value`);
  }

  if (max && value > max) {
    throw new Error(`${field} invalid max value`);
  }

  return true;
};

const validateStringArray = async (field, value, required, min, max) => {
  if (!required && !value) {
    return true;
  }

  if (min && value.length < min) {
    throw new Error(`${field} invalid min size`);
  }

  if (max && value.length > max) {
    throw new Error(`${field} invalid max size`);
  }

  await Promise.all(
    value.map(async (item, idx) =>
      validateString(`${field}[${idx}]`, item, true, null)
    )
  );

  return true;
};

const validateArticle = async (json) => {
  await Promise.all([
    validateString("id", json.id, true, null, 36, 36),
    validateString("title", json.title, true, null, 0, 255),
    validateString("author", json.author, true, null, 0, 100),
    validateDate("modifiedAt", json.modifiedAt, true, true, false),
    validateDate("publishedAt", json.publishedAt, false, true, false),
    validateString(
      "url",
      json.url,
      !!json.publishedAt,
      /^https:\/\/.*$/,
      0,
      100
    ),
    validateNumber("readMins", json.readMins, true, 1, 20),
    validateString(
      "source",
      json.source,
      true,
      /^(ARTICLE|BLOG|TWEET|NEWSPAPER)$/
    ),
    validateStringArray("keywords", json.keywords, true, 1, 3),
  ]);

  return true;
};

const processArticle = async () => {
  const article = await readArticle(articlePath);
  await validateArticle(article);
  return article;
};

processArticle().then(
  (data) => console.debug("Article is Valid 😃"),
  (err) => console.error("Invalid Article 😭", err)
);
