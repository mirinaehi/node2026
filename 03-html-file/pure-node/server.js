const http = require("http");
const path = require("path");
const { readFile } = require("fs/promises");

const PORT = 3200;
const PUBLIC_DIR = path.join(__dirname, "public");
const INDEX_FILE = path.join(PUBLIC_DIR, "index.html");
const NOT_FOUND_FILE = path.join(PUBLIC_DIR, "404.html");

async function sendHtmlFile(res, statusCode, filePath) {
  const html = await readFile(filePath, "utf-8");

  res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (url.pathname === "/") {
      await sendHtmlFile(res, 200, INDEX_FILE);
      return;
    }

    await sendHtmlFile(res, 404, NOT_FOUND_FILE);
  } catch (error) {
    console.error(error);
    sendText(res, 500, "서버에서 HTML 파일을 읽는 중 문제가 발생했습니다.");
  }
});

server.listen(PORT, () => {
  console.log(`Pure Node HTML file server: http://localhost:${PORT}`);
});

