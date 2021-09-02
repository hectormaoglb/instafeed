import { ServiceException } from "../exc/serviceException.mjs";
import {
  findAll,
  findById,
  saveValidArticle,
  deleteById,
  updateById,
} from "../repo/articleRepo.mjs";

import {
  validateArticle,
  validatePartialArticle,
} from "../validator/articleValidator.mjs";

import {
  findById as findAuthorById,
  addArticle,
  delArticle,
} from "../repo/authorRepo.mjs";

import { EventEmitter } from "events";
import { getCache, setCache } from "../cache/cacheRepo.mjs";
import logger from "../logger/logger.mjs";

const emitter = new EventEmitter();

const saveArticleEvent = "ARTICLE_SAVED";

const cacheKey = (id) => `ARTICLE[${id}]`;

const saveArticleCache = async (article) => {
  await setCache(cacheKey(article.id), article);
  logger.info(`Article ${article.id} was stored in cache`, { article });
};

emitter.addListener(saveArticleEvent, saveArticleCache);

export const getAllArticles = async () => findAll();

export const getArticleById = async (articleId) => {
  const cachedArticle = await getCache(cacheKey(articleId));
  if (!!cachedArticle) {
    logger.info(`Getting Article from Cache ${articleId}`);
    return cachedArticle;
  }

  const result = await findById(articleId);
  if (!result) {
    throw new ServiceException(404, `Artcile Not Found [${articleId}]`);
  } else {
    return result;
  }
};

export const saveArticle = async (newArticle) => {
  await validateArticle(newArticle);
  const author = await findAuthorById(newArticle.author);
  if (!author) {
    throw new ServiceException(
      400,
      `Author ${newArticle.author} doesn't exists`
    );
  }
  const savedArticle = await saveValidArticle(newArticle);
  await addArticle(newArticle.author, savedArticle.id);
  emitter.emit(saveArticleEvent, savedArticle);
  return savedArticle;
};

export const deleteArticle = async (id) => {
  const result = await deleteById(id);
  if (!result) {
    throw new ServiceException(404, `Article ${id} not found`);
  }
  await delArticle(result.author, result.id);
  return result;
};

export const updateArticle = async (id, newArticleValues, completeArticle) => {
  if (completeArticle) {
    await validateArticle(newArticleValues);
  } else {
    await validatePartialArticle(newArticleValues);
  }

  if (newArticleValues.author) {
    const author = await findAuthorById(newArticleValues.author);
    if (!author) {
      throw new ServiceException(
        400,
        `Author ${newArticle.author} doesn't exists`
      );
    }
  }

  const result = await updateById(id, newArticleValues);
  if (!result) {
    throw new ServiceException(404, `Article ${id} not found`);
  }

  if (newArticleValues.author) {
    await addArticle(newArticleValues.author, result.id);
  }
  return result;
};
