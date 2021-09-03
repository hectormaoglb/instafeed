import express from "express";

import cors from "cors";

import helmet from "helmet";

import fs from "fs/promises";
import https from "https";

import passport from "passport";

import { BasicStrategy } from "passport-http";

import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";

import { setArticleRoutes } from "../routes/articleRoute.mjs";
import { setAuthorRoutes } from "../routes/authorRoute.mjs";
import { setUserRoutes } from "../routes/userRoute.mjs";
import { setSessionRoutes } from "../routes/sessionRoute.mjs";
import { setCrashRoutes } from "../routes/crashRoute.mjs";

import { getUserById, login } from "../serv/userService.mjs";

import bodyParser from "body-parser";

import logger from "../logger/logger.mjs";

import swaggerUI from "swagger-ui-express";

const setBasicAuthentication = () => {
  passport.use(
    new BasicStrategy(async (username, password, done) => {
      const user = await login(username, password);
      if (!user) {
        return done(null, false, { message: "Invalid user or password" });
      }
      return done(null, user);
    })
  );
};

const setJWTAuthentication = (secretKey) => {
  passport.use(
    new JWTStrategy(
      {
        secretOrKey: secretKey,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
      },
      async (token, done) => {
        const user = await getUserById(token.user.login);
        if (!user) {
          return done(null, false, {
            message: `User ${token.user.login} not found`,
          });
        }
        return done(null, user);
      }
    )
  );
};

export const initWebService = async (port, secretKey) => {
  const app = express();
  setBasicAuthentication();
  setJWTAuthentication(secretKey);

  const key = await fs.readFile("./cert/server.key");
  const cert = await fs.readFile("./cert/server.cert");

  app.use(bodyParser.json());
  app.use(cors());
  app.use(helmet());

  const swaggerDoc = JSON.parse(
    await fs.readFile("./swagger/instafeed_openapi.json")
  );

  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDoc));

  setArticleRoutes(app);
  setAuthorRoutes(app);
  setUserRoutes(app);
  setSessionRoutes(app, secretKey);
  setCrashRoutes(app);

  https
    .createServer(
      {
        key,
        cert,
      },
      app
    )
    .listen(port, () => {
      logger.info(`Instafeed app listening 🏁 at https://localhost:${port}`);
    });
};
