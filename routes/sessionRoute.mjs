import { executeOperation } from "./routeCommons.mjs";
import passport from "passport";
import jwt from "jsonwebtoken";

export const setSessionRoutes = (app, secretKey) => {
  app.post(
    "/session",
    passport.authenticate("basic", { session: false }),
    async (req, res) =>
      executeOperation(async () => {
        const user = req.user;
        const body = { login: user.login, roles: user.roles };
        const token = jwt.sign({ user: body }, secretKey, { expiresIn: "1h" });
        return { token };
      }, res)
  );
};
