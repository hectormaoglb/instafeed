import { executeOperation, executeAdminTask } from "./routeCommons.mjs";
import passport from "passport";

import {
  getAllAuthors,
  getAuthorById,
  saveAuthor,
  deleteAuthor,
  updateAuthor,
} from "../serv/authorService.mjs";

export const setAuthorRoutes = (app) => {
  const authorBasePath = "/authors";
  const authorIdPath = `${authorBasePath}/:authorId`;

  app.get(authorBasePath, async (req, res) =>
    executeOperation(async () => getAllAuthors(), res)
  );

  app.post(
    authorBasePath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeOperation(
        async () => {
          const newAuthor = req.body;
          return saveAuthor(newAuthor);
        },
        res,
        201
      )
  );

  app.get(authorIdPath, async (req, res) =>
    executeOperation(async () => {
      const { authorId } = req.params;
      return getAuthorById(authorId);
    }, res)
  );

  app.delete(
    authorIdPath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeAdminTask(async () => {
        const { authorId } = req.params;
        return deleteAuthor(authorId);
      }, res)(req, res)
  );
  app.put(
    authorIdPath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeOperation(async () => {
        const { authorId } = req.params;
        return updateAuthor(authorId, req.body);
      }, res)
  );
};
