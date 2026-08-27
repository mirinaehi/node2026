const express = require("express");
const path = require("path");
const { readFile } = require("fs/promises");

const app = express();
const PORT = 4100;
const USERS_FILE = path.join(__dirname, "data", "users.json");
const MISSING_FILE = path.join(__dirname, "data", "missing-users.json");

async function readUsers(filePath = USERS_FILE) {
  const text = await readFile(filePath, "utf-8");

  return JSON.parse(text);
}

app.get("/", (req, res) => {
  res.type("html").send(`
    <h1>Express 파일 읽기</h1>
    <p>JSON 파일을 읽고 Express가 응답 처리를 도와줍니다.</p>
    <ul>
      <li><a href="/users">/users</a></li>
      <li><a href="/users/1">/users/1</a></li>
      <li><a href="/missing-file">/missing-file</a></li>
    </ul>
  `);
});

app.get("/users", async (req, res, next) => {
  try {
    const users = await readUsers();

    res.json(users);
  } catch (error) {
    next(error);
  }
});

app.get("/users/:id", async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const users = await readUsers();
    const user = users.find((item) => item.id === userId);

    if (!user) {
      res.status(404).json({
        message: `${userId}번 사용자를 찾을 수 없습니다.`,
      });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

app.get("/missing-file", async (req, res, next) => {
  try {
    const users = await readUsers(MISSING_FILE);

    res.json(users);
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({
    message: "페이지를 찾을 수 없습니다.",
  });
});

app.use((error, req, res, next) => {
  if (error.code === "ENOENT") {
    res.status(404).json({
      message: "파일을 찾을 수 없습니다.",
      code: error.code,
    });
    return;
  }

  if (error instanceof SyntaxError) {
    res.status(500).json({
      message: "JSON 파일 형식이 올바르지 않습니다.",
    });
    return;
  }

  res.status(500).json({
    message: "서버에서 알 수 없는 문제가 발생했습니다.",
  });
});

app.listen(PORT, () => {
  console.log(`Express file-read server: http://localhost:${PORT}`);
});

