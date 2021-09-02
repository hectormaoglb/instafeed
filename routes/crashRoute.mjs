import { executeAdminTask } from "./routeCommons.mjs";
import logger from "../logger/logger.mjs";

export const setCrashRoutes = (app) => {
  app.post("/crash", async (req, res) =>
    executeAdminTask(async () => {
      setTimeout(() => {
        logger.error("Sutdown !!!!");
        process.exit(1);
      }, 1000);
      return { suthdown: "ok" };
    }, res)(req, res)
  );
};
