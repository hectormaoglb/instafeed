import { ServiceException } from "../exc/serviceException.mjs";
import { findAll, findById, saveValidArticle } from "../repo/articleRepo.mjs";

import validateArticle from "../validator/articleValidator.mjs";

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
  try {
    await validateArticle(newArticle);
    await saveValidArticle(newArticle);
  } catch (error) {
    throw error;
  }
};
