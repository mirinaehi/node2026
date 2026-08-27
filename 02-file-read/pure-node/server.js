const http = require("http");
const path = require("path");
const { readFile } = require("fs/promises");

const PORT = 3100;
const USERS_FILE = path.join(__dirname, "data", "users.json");
const MISSING_FILE = path.join(__dirname, "data", "missing-users.json");

async function readUsers(filePath = USERS_FILE) {
  const text = await readFile(filePath, "utf-8");

  return JSON.parse(text);
}

function sendHtml(res, html) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data, null, 2));
}

function sendError(res, error) {
  if (error.code === "ENOENT") {
    sendJson(res, 404, {
      message: "파일을 찾을 수 없습니다.",
      code: error.code,
    });
    return;
  }

  if (error instanceof SyntaxError) {
    sendJson(res, 500, {
      message: "JSON 파일 형식이 올바르지 않습니다.",
    });
    return;
  }

  sendJson(res, 500, {
    message: "서버에서 알 수 없는 문제가 발생했습니다.",
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split("/").filter(Boolean);

  try {
    if (url.pathname === "/") {
      sendHtml(res, `
        <h1>Pure Node 파일 읽기</h1>
        <p>JSON 파일을 직접 읽어서 응답합니다.</p>
        <ul>
          <li><a href="/users">/users</a></li>
          <li><a href="/users/1">/users/1</a></li>
          <li><a href="/missing-file">/missing-file</a></li>
        </ul>
      `);
      return;
    }

    if (url.pathname === "/users") {
      const users = await readUsers();

      sendJson(res, 200, users);
      return;
    }

    if (pathParts[0] === "users" && pathParts[1]) {
      const userId = Number(pathParts[1]);
      const users = await readUsers();
      const user = users.find((item) => item.id === userId);

      if (!user) {
        sendJson(res, 404, {
          message: `${userId}번 사용자를 찾을 수 없습니다.`,
        });
        return;
      }

      sendJson(res, 200, user);
      return;
    }

    if (url.pathname === "/missing-file") {
      const users = await readUsers(MISSING_FILE);

      sendJson(res, 200, users);
      return;
    }

    sendJson(res, 404, {
      message: "페이지를 찾을 수 없습니다.",
    });
  } catch (error) {
    sendError(res, error);
  }
});

server.listen(PORT, () => {
  console.log(`Pure Node file-read server: http://localhost:${PORT}`);
});

