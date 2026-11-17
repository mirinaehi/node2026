import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

// 세션있어.js와 같은 계정으로 비교합니다. JWT에는 비밀번호를 넣지 않습니다.
// http://localhost:3000/login?id=student01&pw=1234
// http://localhost:3000/login?id=admin&pw=admin1234
const users = {
  student01: { password: "1234", role: "student" },
  admin: { password: "admin1234", role: "admin" }
};

// JWT의 서명과 만료 시간을 검증한 뒤, 회원 정보를 req.user에 넣고 다음 처리로 넘깁니다.
export function requireLogin(req, res, next) {
  const token = req.cookies.access_token;
  const secret = req.app.locals.jwtSecret;
  if (!token) return res.status(401).send("로그인이 필요합니다.");

  jwt.verify(token, secret, { algorithms: ["HS256"] }, (error, payload) => {
    if (error) return res.status(401).send("유효하지 않거나 만료된 JWT입니다.");
    req.user = payload;
    next();
  });
}

// 로그인 성공 시 회원 ID와 권한을 담은 JWT에 서명하고, 브라우저 쿠키로 전달합니다.
export function login(req, res) {
  const { id, pw } = req.query;
  const user = users[id];
  if (!Object.hasOwn(users, id) || user.password !== pw) {
    return res.status(401).send("로그인 실패!");
  }

  const secret = req.app.locals.jwtSecret;
  const cookieOptions = req.app.locals.cookieOptions;
  const token = jwt.sign({ userId: id, role: user.role }, secret, {
    algorithm: "HS256",
    expiresIn: "30m"
  });
  res.cookie("access_token", token, { ...cookieOptions, maxAge: 1000 * 60 * 30 });
  res.send(`${id} 로그인 성공! JWT가 발급되었습니다.`);
}

export function mypage(req, res) {
  res.send(`안녕하세요, ${req.user.userId}님!`);
}

// 관리자 판단에는 requireLogin이 검증한 JWT의 role을 사용합니다.
export function admin(req, res) {
  if (req.user.role !== "admin") {
    return res.status(403).send("관리자 권한이 없습니다.");
  }
  res.send("관리자 페이지에 접근했습니다!");
}

// 브라우저 쿠키를 삭제합니다. 발급한 JWT 자체는 만료까지 유효합니다.
export function logout(req, res) {
  res.clearCookie("access_token", req.app.locals.cookieOptions);
  res.send("로그아웃 완료!");
}

// 앱을 만들고 공통 설정과 라우트를 연결합니다. 각 요청의 처리 함수는 바깥에 따로 정의합니다.
export function createJwtApp({ secret = process.env.JWT_SECRET || "classroom-jwt-demo-secret-change-me-2026" } = {}) {
  const app = express();
  app.locals.jwtSecret = secret;
  app.locals.cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" };

  app.use(cookieParser());
  app.get("/login", login);
  app.get("/mypage", requireLogin, mypage);
  app.get("/admin", requireLogin, admin);
  app.get("/logout", logout);

  return app;
}

// process.argv[1]에는 Node.js로 직접 실행한 파일의 경로가 들어 있습니다.
// 그 경로가 jwt.js로 끝날 때만 서버를 켭니다.
// 따라서 `node jwt.js`로 실행하면 서버가 켜지지만, 테스트에서 import할 때는 서버가 켜지지 않습니다.
// 파이썬에서 __name__ == "__main__"과 같은 역할을 합니다.
if (process.argv[1]?.endsWith("jwt.js")) {
  const PORT = process.env.PORT || 3000;
  const app = createJwtApp();
  app.listen(PORT, () => {
    console.log(`JWT server is running at http://localhost:${PORT}`);
  });
}
