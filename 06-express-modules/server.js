import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import messageRoutes from "./routes/messages.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4500;
const PUBLIC_DIR = path.join(__dirname, "public");

app.use(express.static(PUBLIC_DIR));
app.use("/api/messages", messageRoutes);

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    example: "express-modules",
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
  console.log(`Express modules server: http://localhost:${PORT}`);
});

