import { ServiceException } from "../exc/serviceException.mjs";
import {
  init as initRepo,
  loadArticles,
  findAll,
  findById,
  saveValidArticle,
  saveInvalidArticle,
} from "../repo/articleRepo.mjs";

import validateArticle from "../validator/articleValidator.mjs";

export const init = async (validArticlePath, invalidArticlePath) => {
  initRepo({
    validPath: validArticlePath,
    invalidPath: invalidArticlePath,
  });
  try {
    await loadArticles();
    console.log("Articles were loaded ... 📰");
  } catch (error) {
    console.log("Error loading articles ... ❌", error);
  }
};

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
    saveInvalidArticle(newArticle);
    throw error;
  }
};
