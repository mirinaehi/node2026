const express = require("express");
const path = require("path");
const { readFile } = require("fs/promises");

const app = express();
const PORT = 4400;
const PUBLIC_DIR = path.join(__dirname, "public");
const MESSAGES_FILE = path.join(__dirname, "data", "messages.json");

async function readMessages() {
  const text = await readFile(MESSAGES_FILE, "utf-8");

  return JSON.parse(text);
}

app.use(express.static(PUBLIC_DIR));

app.get("/api/messages", async (req, res, next) => {
  try {
    const messages = await readMessages();

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

app.get("/api/messages/:id", async (req, res, next) => {
  try {
    const messageId = Number(req.params.id);
    const messages = await readMessages();
    const message = messages.find((item) => item.id === messageId);

    if (!message) {
      res.status(404).json({
        message: `${messageId}번 메시지를 찾을 수 없습니다.`,
      });
      return;
    }

    res.json(message);
  } catch (error) {
    next(error);
  }
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    example: "express-fetch-api",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "요청한 주소를 찾을 수 없습니다.",
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (error.code === "ENOENT") {
    res.status(500).json({
      message: "메시지 데이터 파일을 찾을 수 없습니다.",
    });
    return;
  }

  if (error instanceof SyntaxError) {
    res.status(500).json({
      message: "메시지 데이터 JSON 형식이 올바르지 않습니다.",
    });
    return;
  }

  res.status(500).json({
    message: "서버에서 알 수 없는 문제가 발생했습니다.",
  });
});

app.listen(PORT, () => {
  console.log(`Express fetch API server: http://localhost:${PORT}`);
});

