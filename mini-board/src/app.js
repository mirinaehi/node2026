import cors from "cors";
import express from "express";
import { indexFilePath, notFoundFilePath, publicDirectoryPath } from "./config/paths.js";
import { addRequestTime, requestLogger } from "./middleware/requestLogger.js";
import apiRouter from "./routes/apiRouter.js";

const app = express();
const reactDevOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

// app.use에 등록한 순서대로 미들웨어가 실행됩니다.
app.use(addRequestTime);
app.use(requestLogger);

// React 개발 서버(5173)에서 Express API(3000)를 호출할 수 있도록 개발 출처를 허용합니다.
// 주석을 해제하세요
// app.use(
//   cors({
//     origin: reactDevOrigins
//   })
// );

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
