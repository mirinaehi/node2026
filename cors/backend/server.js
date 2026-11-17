import express from "express";
import cors from "cors";

const app = express();

// 브라우저가 http://localhost:3000에서 보낸 요청만 허용합니다.
// 프런트엔드와 API 서버의 포트가 다르기 때문에 이 CORS 설정이 필요합니다.
// app.use(cors({
//   origin: "http://localhost:3000"
// }));

app.get("/api/message", (req, res) => {
  res.json({ message: "API 서버가 보낸 데이터입니다." });
});

app.listen(4000, () => {
  console.log("API server: http://localhost:4000");
});
