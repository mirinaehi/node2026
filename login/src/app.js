import express from "express";
import { createUser, findByEmail, hashPassword, publicUser, verifyPassword } from "./users.js";
import { createSession, getSession, destroySession } from "./sessions.js";

export function createApp({ usersFile = "C:/dev/node2026/login/data/users.json", secureCookies = process.env.NODE_ENV === "production" } = {}) {
  const app = express();
  // 이 앱의 로그인 기록을 보관하며, 세션 함수에 전달해 생성·조회·삭제합니다.
  const sessions = new Map();

  // 요청의 JSON을 req.body 객체로 바꿉니다. 아래 API들은 이 객체에서 입력값을 읽습니다.
  app.use(express.json());

  // 회원가입: 입력받은 비밀번호를 해시로 바꾸고 회원 정보를 저장합니다.
  app.post("/api/signup", (req, res) => {
    const { name, email, password } = req.body;
    const passwordHash = hashPassword(password);
    const user = createUser({ name, email, passwordHash }, usersFile);
    if (!user) return res.status(409).json({ message: "이미 가입된 이메일입니다." });

    res.status(201).json({ message: "회원가입이 완료되었습니다. 로그인해 주세요.", user: publicUser(user) });
  });

  // 로그인: 이메일로 회원 찾기 → 비밀번호 비교 → 로그인 상태를 기억할 세션 만들기.
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = findByEmail(email, usersFile);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const safeUser = publicUser(user);
    createSession(sessions, req, res, safeUser, secureCookies);
    res.json({ message: "로그인되었습니다.", user: safeUser });
  });

  // 브라우저의 쿠키와 서버의 세션을 대조해 현재 로그인한 회원을 확인합니다.
  app.get("/api/me", (req, res) => {
    const user = getSession(sessions, req);
    if (!user) return res.status(401).json({ message: "로그인이 필요합니다." });
    res.json({ user });
  });

  app.post("/api/logout", (req, res) => {
    destroySession(sessions, req, res, secureCookies);
    res.json({ message: "로그아웃되었습니다." });
  });

  // 절대 경로를 사용하면 어느 폴더에서 실행하든 같은 public 폴더를 찾습니다.
  app.use(express.static("C:/dev/node2026/login/public"));

  return app;
}
