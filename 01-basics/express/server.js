const express = require("express");

const app = express();
const PORT = 4000;

app.get("/", (req, res) => {
  res.type("html").send(`
    <h1>Express 서버</h1>
    <p>Express가 라우팅과 응답 처리를 도와줍니다.</p>
    <ul>
      <li><a href="/hello?name=Jin">/hello?name=Jin</a></li>
      <li><a href="/time">/time</a></li>
    </ul>
  `);
});

app.get("/hello", (req, res) => {
  const name = req.query.name || "익명";

  res.send(`안녕하세요, ${name}님!`);
});

app.get("/time", (req, res) => {
  res.json({
    now: new Date().toISOString(),
    server: "express",
  });
});

app.use((req, res) => {
  res.status(404).send("페이지를 찾을 수 없습니다.");
});

app.listen(PORT, () => {
  console.log(`Express server: http://localhost:${PORT}`);
});

