import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4700;
const PUBLIC_DIR = path.join(__dirname, "public");
const MESSAGES_FILE = path.join(__dirname, "data", "messages.json");

async function readMessages() {
  const fileContent = await fs.readFile(MESSAGES_FILE, "utf8");
  return JSON.parse(fileContent);
}

async function writeMessages(messages) {
  const fileContent = JSON.stringify(messages, null, 2);
  await fs.writeFile(MESSAGES_FILE, `${fileContent}\n`, "utf8");
}

function getNextMessageId(messages) {
  const ids = messages.map((message) => message.id);
  return Math.max(0, ...ids) + 1;
}

app.use(express.static(PUBLIC_DIR));
app.use(express.json());

app.get("/api/messages", async (req, res) => {
  const messages = await readMessages();
  res.json(messages);
});

app.post("/api/messages", async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    res.status(400).json({
      message: "title과 body를 모두 입력해주세요.",
    });
    return;
  }

  const messages = await readMessages();
  const newMessage = {
    id: getNextMessageId(messages),
    title,
    body,
  };

  messages.push(newMessage);
  await writeMessages(messages);

  res.status(201).json(newMessage);
});

app.get("/health", async (req, res) => {
  const messages = await readMessages();

  res.json({
    ok: true,
    example: "express-post-json",
    messageCount: messages.length,
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "요청한 주소를 찾을 수 없습니다.",
  });
});

app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    res.status(400).json({
      message: "요청 JSON 형식이 올바르지 않습니다.",
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    message: "서버에서 알 수 없는 문제가 발생했습니다.",
  });
});

app.listen(PORT, () => {
  console.log(`Express POST JSON server: http://localhost:${PORT}`);
});
