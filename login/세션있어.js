
import express from "express";
import session from "express-session";

const app = express();

// http://localhost:3000/login?id=student01&pw=1234
// http://localhost:3000/login?id=admin&pw=admin1234

// 실습용 사용자 정보
const users = {
  student01: { password: "1234", role: "student" },
  admin: { password: "admin1234", role: "admin" }
};

// 세션 미들웨어
app.use(session({
  name: "connect.sid",
  secret: "classroom-demo-secret-change-me-2026",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // localhost HTTP 실습용
    sameSite: "lax",
    maxAge: 1000 * 60 * 30 // 30분
  }
}));

// 1. 로그인
app.get("/login", (req, res) => {
  const { id, pw } = req.query;
  const user = users[id];

  if (!user || user.password !== pw) {
    return res.status(401).send("로그인 실패!");
  }

  // 로그인 성공 시 세션 ID 재발급
  req.session.regenerate((err) => {
    if (err) return res.status(500).send("세션 오류");

    // 서버에 로그인 정보 저장
    req.session.userId = id;
    req.session.role = user.role;

    res.send(`${id} 로그인 성공!`);
  });
});

// 2. 마이페이지
app.get("/mypage", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).send("로그인이 필요합니다.");
  }

  res.send(`안녕하세요, ${userId}님!`);
});

// 3. 관리자 페이지
app.get("/admin", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("로그인이 필요합니다.");
  }

  if (req.session.role !== "admin") {
    return res.status(403).send("관리자 권한이 없습니다.");
  }

  res.send("관리자 페이지에 접근했습니다!");
});

// 4. 로그아웃
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("로그아웃 실패");

    res.clearCookie("connect.sid");
    res.send("로그아웃 완료!");
  });
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
