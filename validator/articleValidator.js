const validate = require("json-schema").validate;
const schema = require("./article.schema.json");

const checkPastDate = (field, value, result, required) => {
  if (!value && !required) {
    return result;
  }
  const now = new Date();
  if (now < value) {
    return {
      valid: false,
      errors: [
        ...result.errors,
        { property: field, message: "must be in past" },
      ],
    };
  }
  return result;
};

const checkUrl = (field, value, publishedAt, result) => {
  if (publishedAt && !value) {
    return {
      valid: false,
      errors: [
        ...result.errors,
        { property: field, message: "field is required" },
      ],
    };
  }
  return result;
};

const validateArticle = async (article) => {
  let result = validate(article, schema);
  if (result.valid) {
    const modifiedAt = new Date(article.modifiedAt);
    const publishedAt = article.publishedAt
      ? new Date(article.publishedAt)
      : undefined;
    result = checkPastDate("modifiedAt", modifiedAt, result, true);
    result = checkPastDate("publishedAt", publishedAt, result, false);
    result = checkUrl("url", article.url, publishedAt, result);
  }

  if (!result.valid) {
    const msg = result.errors
      .map((err) => `${err.property} - ${err.message}`)
      .join("\n");
    throw new Error(msg);
  }

  return true;
};

module.exports = validateArticle;
