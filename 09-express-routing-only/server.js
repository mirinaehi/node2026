import express from "express";

const app = express();
const PORT = 4800;

const users = [
  { id: 1, name: "Jin", role: "backend learner" },
  { id: 2, name: "Mina", role: "frontend learner" },
  { id: 3, name: "Hyun", role: "fullstack learner" },
];

app.get("/", (req, res) => {
  res.json({
    message: "Express 라우팅만 보는 예제입니다.",
    routes: [
      "/hello",
      "/hello/Jin",
      "/users",
      "/users/1",
      "/search?keyword=node",
    ],
  });
});

app.get("/hello", (req, res) => {
  res.json({
    message: "안녕하세요!",
  });
});

app.get("/hello/:name", (req, res) => {
  res.json({
    message: `안녕하세요, ${req.params.name}님!`,
    params: req.params,
  });
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.get("/users/:id", (req, res) => {
  const userId = Number(req.params.id);
  const user = users.find((item) => item.id === userId);

  if (!user) {
    res.status(404).json({
      message: `${userId}번 사용자를 찾을 수 없습니다.`,
    });
    return;
  }

  res.json(user);
});

app.get("/search", (req, res) => {
  const keyword = req.query.keyword || "";

  res.json({
    keyword,
    message: keyword
      ? `"${keyword}" 검색어를 받았습니다.`
      : "keyword 쿼리스트링을 입력해보세요.",
    example: "/search?keyword=node",
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    example: "express-routing-only",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "등록된 라우트를 찾을 수 없습니다.",
    path: req.path,
  });
});

app.listen(PORT, () => {
  console.log(`Express routing-only server: http://localhost:${PORT}`);
});

