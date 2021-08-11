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

export const getAllArticles = async () => findAll();

export const getArticleById = async (articleId) => {
  const result = await findById(articleId);
  if (!result) {
    throw new ServiceException(404, `Artcile Not Found [${articleId}]`);
  } else {
    return result;
  }
};

export const saveArticle = async (newArticle) => {
  await validateArticle(newArticle);
  return saveValidArticle(newArticle);
};

export const deleteArticle = async (id) => {
  const result = await deleteById(id);
  if (!result) {
    throw new ServiceException(404, `Article ${id} not found`);
  }
  return result;
};

export const updateArticle = async (id, newArticleValues, completeArticle) => {
  if (completeArticle) {
    await validateArticle(newArticleValues);
  } else {
    await validatePartialArticle(newArticleValues);
  }
  const result = await updateById(id, newArticleValues);
  if (!result) {
    throw new ServiceException(404, `Article ${id} not found`);
  }
  return result;
};
