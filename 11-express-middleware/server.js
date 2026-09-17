import express from "express";

const app = express();
const PORT = 5000;

function requestLogger(req, res, next) {
  console.log(`[${req.method}] ${req.path}`);
  next();
}

function addRequestTime(req, res, next) {
  req.requestTime = new Date().toISOString();
  next();
}

function requireApiKey(req, res, next) {
  if (req.query.apiKey !== "secret") {
    return res.status(401).json({
      message: "관리자 API를 사용하려면 올바른 apiKey가 필요합니다.",
      hint: "/admin?apiKey=secret",
    });
  }

  next();
}

app.use(requestLogger);
app.use(addRequestTime);

app.get("/", (req, res) => {
  res.json({
    message: "Express 미들웨어 예제입니다.",
    routes: [
      "/public",
      "/admin",
      "/admin?apiKey=secret",
      "/health",
    ],
  });
});

app.get("/public", (req, res) => {
  res.json({
    route: "public",
    message: "누구나 볼 수 있는 응답입니다.",
    requestTime: req.requestTime,
  });
});

app.get("/admin", requireApiKey, (req, res) => {
  res.json({
    route: "admin",
    message: "apiKey 검사를 통과한 요청입니다.",
    requestTime: req.requestTime,
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    example: "express-middleware",
    requestTime: req.requestTime,
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "해당 주소를 찾을 수 없습니다.",
    path: req.path,
    requestTime: req.requestTime,
  });
});

app.listen(PORT, () => {
  console.log(`Express middleware server: http://localhost:${PORT}`);
});
