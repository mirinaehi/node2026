import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4700;
const PUBLIC_DIR = path.join(__dirname, "public");

let nextMessageId = 4;
const messages = [
  {
    id: 1,
    title: "GET 요청",
    body: "GET /api/messages는 서버에 있는 메시지 목록을 가져옵니다.",
  },
  {
    id: 2,
    title: "POST 요청",
    body: "POST /api/messages는 브라우저가 서버로 새 메시지를 보냅니다.",
  },
  {
    id: 3,
    title: "express.json()",
    body: "express.json()이 JSON 요청 본문을 req.body로 읽을 수 있게 해줍니다.",
  },
];

app.use(express.static(PUBLIC_DIR));
app.use(express.json());

app.get("/api/messages", (req, res) => {
  res.json(messages);
});

app.post("/api/messages", (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    res.status(400).json({
      message: "title과 body를 모두 입력해주세요.",
    });
    return;
  }

  const newMessage = {
    id: nextMessageId,
    title,
    body,
  };

  nextMessageId += 1;
  messages.push(newMessage);

  res.status(201).json(newMessage);
});

app.get("/health", (req, res) => {
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
  if (error instanceof SyntaxError) {
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
