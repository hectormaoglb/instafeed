import passport from "passport";

import logger from "../logger/logger.mjs";

const buildError = (error) => ({
  status: error.status || 500,
  message: error.message,
  error,
});

const reply = (status, payload, res) => {
  res.header("Content-Type", "application/json");
  res.status(status);
  res.send(JSON.stringify(payload));
};

export const replyWithError = (error, res) => {
  logger.error(`Error processing request: ${error.message} ❌`, error);
  const payload = buildError(error);
  reply(payload.status, payload, res);
};

export const executeOperation = async (callServiceSupplier, res, okStatus) => {
  try {
    const result = await callServiceSupplier();
    const status = okStatus || 200;
    reply(status, result, res);
  } catch (error) {
    replyWithError(error, res);
  }
};

export const executeAdminTask = (supplier, res) =>
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return replyWithError(err, res);
    }

    if (!user) {
      return replyWithError(
        new ServiceException(401, "Unauthorized User"),
        res
      );
    }

    if (!user.roles.includes("admin")) {
      return replyWithError(
        new ServiceException(401, "Unauthorized User"),
        res
      );
    }
    executeOperation(supplier, res);
  });
