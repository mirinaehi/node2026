import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4200;
const PUBLIC_DIR = path.join(__dirname, "public");
const INDEX_FILE = path.join(PUBLIC_DIR, "index.html");
const NOT_FOUND_FILE = path.join(PUBLIC_DIR, "404.html");

app.get("/", (req, res, next) => {
  res.sendFile(INDEX_FILE, (error) => {
    if (error) {
      next(error);
    }
  });
});

app.use((req, res, next) => {
  res.status(404).sendFile(NOT_FOUND_FILE, (error) => {
    if (error) {
      next(error);
    }
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).type("text").send("서버에서 HTML 파일을 보내는 중 문제가 발생했습니다.");
});

app.listen(PORT, () => {
  console.log(`Express HTML file server: http://localhost:${PORT}`);
});
