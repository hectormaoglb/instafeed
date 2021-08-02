import http from "http";
import { init, processArticleRequest } from "./serv/articleService.mjs";

const port = parseInt(process.argv[2] || "8080");
const validArticlePath = process.argv[3] || "./db.json";
const invalidArticlePath = process.argv[4] || "./invalid.json";

init(validArticlePath, invalidArticlePath).then(
  (data) => console.log("Service Ready ✅"),
  (error) => console.error("Service initialization error ❌", error)
);

const server = http.createServer(async (req, res) => {
  const path = req.url;
  res.setHeader("Content-Type", "application/json");

  let status = 200;
  let result = {};
  try {
    result = await processArticleRequest(req);
    console.log(
      JSON.stringify({
        msg: "Operation Successfully 🏁",
        path,
        result,
      })
    );
  } catch (error) {
    console.error(error);
    status = error.status || 500;
    result = {
      msg: error.message,
      path,
    };
  }
  res.statusCode = status;
  res.end(JSON.stringify(result));
});

server.listen(port, () => {
  console.log(`Server running at port ${port} 🛫`);
});
