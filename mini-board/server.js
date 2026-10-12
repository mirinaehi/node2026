import http from "node:http";
import { readFile } from "node:fs/promises";

const PORT = 3000;
const postsFilePath = new URL("./data/posts.json", import.meta.url);
const indexFilePath = new URL("./public/index.html", import.meta.url);
const notFoundFilePath = new URL("./public/404.html", import.meta.url);

async function readPosts() {
  const fileContents = await readFile(postsFilePath, "utf-8");
  return JSON.parse(fileContents);
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

async function sendHtmlFile(res, statusCode, filePath) {
  const html = await readFile(filePath, "utf-8");
  res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  console.log(`${req.method} ${requestUrl.pathname}`);

  if (requestUrl.pathname === "/") {
    try {
      await sendHtmlFile(res, 200, indexFilePath);
    } catch (error) {
      console.error(error);
      sendText(res, 500, "첫 화면 HTML 파일을 읽을 수 없습니다.");
    }
    return;
  }

  if (requestUrl.pathname === "/health") {
    sendJson(res, 200, {
      status: "ok",
      project: "mini-board",
      step: 3
    });
    return;
  }

  if (requestUrl.pathname === "/posts") {
    try {
      const posts = await readPosts();
      sendJson(res, 200, posts);
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { message: "게시글 파일을 읽을 수 없습니다." });
    }
    return;
  }

  if (requestUrl.pathname.startsWith("/posts/")) {
    try {
      const posts = await readPosts();
      const postId = Number(requestUrl.pathname.replace("/posts/", ""));
      const post = posts.find((item) => item.id === postId);

      if (!post) {
        sendJson(res, 404, { message: "게시글을 찾을 수 없습니다." });
        return;
      }

      sendJson(res, 200, post);
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { message: "게시글 파일을 읽을 수 없습니다." });
    }
    return;
  }

  try {
    await sendHtmlFile(res, 404, notFoundFilePath);
  } catch (error) {
    console.error(error);
    sendText(res, 404, "요청한 주소를 찾을 수 없습니다.");
  }
});

server.listen(PORT, () => {
  console.log(`Mini Board server is running at http://localhost:${PORT}`);
});
