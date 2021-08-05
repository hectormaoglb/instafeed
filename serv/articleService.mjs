import { ServiceException } from "../exc/serviceException.mjs";
import {
  init as initRepo,
  loadArticles,
  findAll,
  findById,
} from "../repo/articleRepo.mjs";

const processors = [
  {
    path: /\/articles\/(.*)$/,
    execute: async (req, routeMatch) => {
      const articleId = routeMatch[1];
      const result = await findById(articleId);
      if (!result) {
        throw new ServiceException(404, `Artcile Not Found [${articleId}]`);
      } else {
        return result;
      }
    },
  },
  {
    path: /\/articles$/,
    execute: async (req, routeMatch) => findAll(),
  },
  {
    path: /.*/,
    execute: async (req, routeMatch) => {
      throw new ServiceException(404, `Resource Not Found [${req.url}]`);
    },
  },
];

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
