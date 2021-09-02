import { executeOperation, executeAdminTask } from "./routeCommons.mjs";
import passport from "passport";
import {
  getAllArticles,
  getArticleById,
  saveArticle,
  deleteArticle,
  updateArticle,
} from "../serv/articleService.mjs";

export const setArticleRoutes = (app) => {
  const articleBasePath = "/articles";
  const articleIdPath = `${articleBasePath}/:articleId`;

  app.get(articleBasePath, async (req, res) =>
    executeOperation(async () => getAllArticles(), res)
  );

  app.post(
    articleBasePath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeOperation(
        async () => {
          const newArticle = req.body;
          return saveArticle(newArticle);
        },
        res,
        201
      )
  );

  app.get(articleIdPath, async (req, res) =>
    executeOperation(async () => {
      res.header("Cache-Control", "private");
      const { articleId } = req.params;
      return getArticleById(articleId);
    }, res)
  );

  app.delete(articleIdPath, async (req, res) =>
    executeAdminTask(async () => {
      const { articleId } = req.params;
      return deleteArticle(articleId);
    }, res)(req, res)
  );
  app.put(
    articleIdPath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeOperation(async () => {
        const { articleId } = req.params;
        const article = { ...req.body, id: articleId };
        return updateArticle(articleId, article, true);
      }, res)
  );
  app.patch(
    articleIdPath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeOperation(async () => {
        const { articleId } = req.params;
        const article = req.body;
        return updateArticle(articleId, article, false);
      }, res)
  );
};
