import { executeOperation, executeAdminTask } from "./routeCommons.mjs";
import passport from "passport";

import {
  getAllUsers,
  getUserById,
  saveUser,
  deleteUser,
  updateUser,
} from "../serv/userService.mjs";

export const setUserRoutes = (app) => {
  const userBasePath = "/users";
  const userIdPath = `${userBasePath}/:userId`;

  app.get(userBasePath, async (req, res) =>
    executeOperation(async () => getAllUsers(), res)
  );

  app.post(
    userBasePath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeOperation(
        async () => {
          const newUser = req.body;
          return saveUser(newUser);
        },
        res,
        201
      )
  );

  app.get(userIdPath, async (req, res) =>
    executeOperation(async () => {
      const { userId } = req.params;
      return getUserById(userId);
    }, res)
  );

  app.delete(
    userIdPath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeAdminTask(async () => {
        const { userId } = req.params;
        return deleteUser(userId);
      }, res)(req, res)
  );
  app.put(
    userIdPath,
    passport.authenticate("jwt", { session: false }),
    async (req, res) =>
      executeOperation(async () => {
        const { userId } = req.params;
        return updateUser(userId, req.body);
      }, res)
  );
};
