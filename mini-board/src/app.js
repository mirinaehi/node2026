import express from "express";
import { indexFilePath, notFoundFilePath, publicDirectoryPath } from "./config/paths.js";
import apiRouter from "./routes/apiRouter.js";

const app = express();

// JSON 요청 본문을 req.body 객체로 바꿔 POST 라우트에서 사용할 수 있게 합니다.
app.use(express.json());

// 정적 파일 제공은 앱 전체 설정에 가까워서 Express 앱을 조립하는 곳에 둡니다.
app.use("/static", express.static(publicDirectoryPath));

app.get("/", (req, res) => {
  res.sendFile(indexFilePath);
});

// /api로 시작하는 요청은 API 관련 라우트를 모아 둔 apiRouter로 넘깁니다.
app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).sendFile(notFoundFilePath);
});

export default app;
