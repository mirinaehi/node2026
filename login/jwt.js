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

export function createJwtApp({ secret = process.env.JWT_SECRET || "classroom-jwt-demo-secret-change-me-2026" } = {}) {
  const app = express();
  const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" };

  app.use(cookieParser());

  // 서버의 세션을 조회하는 대신 쿠키에 담긴 JWT의 서명과 만료 시간을 검증합니다.
  // 검증을 통과한 회원 정보는 req.user에 넣고, next()로 다음 라우트 함수를 실행합니다.
  function requireLogin(req, res, next) {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).send("로그인이 필요합니다.");

    jwt.verify(token, secret, { algorithms: ["HS256"] }, (error, payload) => {
      if (error) return res.status(401).send("유효하지 않거나 만료된 JWT입니다.");
      req.user = payload;
      next();
    });
  }

  // 로그인 성공 시 회원 ID와 권한을 담은 JWT에 서명하고, 브라우저 쿠키로 전달합니다.
  // sign은 토큰 발급, verify는 토큰 검증입니다. 두 작업에 같은 서명 키를 사용합니다.
  app.get("/login", (req, res) => {
    const { id, pw } = req.query;
    const user = users[id];
    if (!Object.hasOwn(users, id) || user.password !== pw) {
      return res.status(401).send("로그인 실패!");
    }

    const token = jwt.sign({ userId: id, role: user.role }, secret, {
      algorithm: "HS256",
      expiresIn: "30m"
    });
    res.cookie("access_token", token, { ...cookieOptions, maxAge: 1000 * 60 * 30 });
    res.send(`${id} 로그인 성공! JWT가 발급되었습니다.`);
  });

  app.get("/mypage", requireLogin, (req, res) => {
    res.send(`안녕하세요, ${req.user.userId}님!`);
  });

  // 관리자 판단에는 서명을 검증한 JWT의 role을 사용합니다.
  app.get("/admin", requireLogin, (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).send("관리자 권한이 없습니다.");
    }
    res.send("관리자 페이지에 접근했습니다!");
  });

  // 이 예제의 로그아웃은 브라우저 쿠키를 삭제합니다. 발급한 JWT 자체는 만료까지 유효합니다.
  app.get("/logout", (req, res) => {
    res.clearCookie("access_token", cookieOptions);
    res.send("로그아웃 완료!");
  });

  return app;
}

// 직접 실행할 때 서버를 켜고, 테스트에서 가져올 때는 앱 생성 함수만 사용합니다.
if (process.argv[1]?.endsWith("jwt.js")) {
  const PORT = process.env.PORT || 3000;
  const app = createJwtApp();
  app.listen(PORT, () => {
    console.log(`JWT server is running at http://localhost:${PORT}`);
  });
}
