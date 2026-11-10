
import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());

// 1. 쿠키 발급
app.get("/login", (req, res) => {
  res.cookie("userId", "student01", {
    httpOnly: true,
    sameSite: "lax"
  });

  res.send("로그인 완료! 쿠키가 발급되었습니다.");
});

// 2. 쿠키 확인
app.get("/mypage", (req, res) => {
  const userId = req.cookies.userId;

  if (!userId) {
    return res.send("로그인이 필요합니다.");
  }

  res.send(`안녕하세요, ${userId}님!`);
});

// 3. 관리자 페이지 (취약한 코드)
app.get("/admin", (req, res) => {
  const userId = req.cookies.userId;

  if (userId === "admin") {
    return res.send("관리자 페이지에 접근했습니다!");
  }

  res.status(403).send("관리자만 접근할 수 있습니다.");
});

// 4. 로그아웃
app.get("/logout", (req, res) => {
  res.clearCookie("userId");
  res.send("로그아웃 완료!");
});

app.listen(3000, () => {
  console.log("서버 실행: http://localhost:3000");
});
