// 이 파일은 브라우저의 요청을 받아 회원 저장과 세션 관리 기능을 연결합니다.
// API는 브라우저가 서버에 데이터를 요청할 때 사용하는 약속된 주소와 처리 방식입니다.
import express from "express";
import { fileURLToPath } from "node:url";
import { createUserStore, hashPassword, publicUser, verifyPassword } from "./users.js";
import { createSessions } from "./sessions.js";

// import.meta.url은 현재 파일의 위치입니다. 이 위치를 기준으로 경로를 만들면
// 어느 폴더에서 서버를 실행해도 public 폴더와 회원 파일을 올바르게 찾습니다.
const publicDirectory = fileURLToPath(new URL("../public/", import.meta.url));
const defaultUsersFile = fileURLToPath(new URL("../data/users.json", import.meta.url));

// 가입과 로그인에서 공통으로 사용하는 입력 검사입니다.
// 브라우저의 검사를 건너뛰고 API를 직접 호출할 수 있으므로 서버에서도 검사해야 합니다.
function readCredentials(body) {
  // ?.는 body가 null이거나 없어도 에러 없이 값을 확인하게 해 줍니다.
  // 조건 ? 참일 때 값 : 거짓일 때 값 문법으로 문자열이 아닌 입력을 빈 문자열로 바꿉니다.
  // trim은 앞뒤 공백 제거, toLowerCase는 소문자 변환입니다.
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  // 비밀번호의 공백과 대소문자는 사용자가 입력한 그대로 유지합니다.
  const password = typeof body?.password === "string" ? body.password : "";
  // /.../는 문자열의 형태를 검사하는 정규표현식입니다.
  // 여기서는 공백 없이 '내용@내용.내용' 형태인지 간단히 검사합니다.
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "올바른 이메일 주소를 입력해 주세요." };
  }
  if (password.length < 8 || password.length > 128) {
    return { error: "비밀번호는 8~128자로 입력해 주세요." };
  }
  return { email, password };
}

// async 함수는 시간이 걸리는 작업의 결과를 Promise로 돌려줍니다.
// Promise는 '아직 끝나지 않은 작업의 결과'를 나타내며 await로 완료를 기다릴 수 있습니다.
// 이 함수는 라우트 함수를 감싸서, 파일 읽기 등의 작업 실패를 catch(next)로 전달합니다.
// Express 4에서는 이런 비동기 에러를 마지막 에러 미들웨어에 직접 넘겨야 합니다.
const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res)).catch(next);
};

// export는 다른 파일에서도 이 함수를 가져다 쓸 수 있게 공개한다는 뜻입니다.
// { ... } = {} 덕분에 설정을 생략해도 기본값으로 앱을 만들 수 있습니다.
// 테스트에서는 usersFile을 임시 파일 경로로 지정하여 실제 회원 파일을 보호합니다.
export function createApp({ usersFile = defaultUsersFile, secureCookies = process.env.NODE_ENV === "production" } = {}) {
  // express()로 요청을 처리할 앱을 만들고, 이 앱만의 회원 저장소와 세션 관리자를 준비합니다.
  const app = express();
  const users = createUserStore(usersFile);
  const sessions = createSessions({ secure: secureCookies });
  // Map은 '키 → 값'을 저장하는 자료구조입니다. 여기서는 IP → 요청 횟수를 기록합니다.
  const attempts = new Map();

  // 응답 헤더에 사용 중인 서버 프레임워크 이름을 표시하지 않습니다.
  app.disable("x-powered-by");
  // 미들웨어는 요청이 최종 처리 함수에 도착하기 전에 실행하는 공통 처리 함수입니다.
  // req는 받은 요청, res는 보낼 응답, next는 다음 처리로 넘기는 함수입니다.
  // app.use로 등록한 순서대로 실행되므로 아래 순서도 앱 동작의 일부입니다.
  app.use((req, res, next) => {
    // 헤더는 응답 본문 외에 브라우저에 전달하는 부가 정보와 처리 지침입니다.
    // 파일 형식을 임의로 추측하지 않게 하고, 이 서버의 리소스만 불러오도록 제한합니다.
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none'; form-action 'self'");
    next();
  });
  app.use("/api", (req, res, next) => {
    // 로그인한 회원 정보 등이 브라우저 캐시에 저장되지 않도록 지시합니다.
    res.setHeader("Cache-Control", "no-store");
    // JSON만 받아 다른 사이트의 HTML form을 통한 인증 요청을 막습니다.
    if (req.method === "POST" && !req.is("application/json")) {
      // status는 HTTP 상태 코드, json은 JavaScript 객체를 JSON 응답으로 보내는 함수입니다.
      // return을 붙여 응답을 보낸 뒤 다음 코드가 계속 실행되지 않게 합니다.
      return res.status(415).json({ message: "JSON 형식으로 요청해 주세요." });
    }
    next();
  });
  // JSON은 객체나 배열을 문자열로 표현하는 데이터 형식입니다.
  // express.json은 요청의 JSON 문자열을 객체로 바꿔 req.body에 넣습니다.
  // 아래 라우트들이 req.body를 사용하므로 라우트보다 먼저 등록합니다.
  app.use(express.json({ limit: "10kb" }));

  // 짧은 시간에 가입이나 로그인을 지나치게 반복하는 요청을 제한합니다.
  // 회원가입과 로그인이 같은 Map을 사용하므로 두 주소의 요청 횟수를 합산합니다.
  function limitAttempts(req, res, next) {
    // Date.now()는 현재 시각을 밀리초 단위 숫자로 돌려줍니다. 1초는 1,000밀리초입니다.
    const now = Date.now();
    for (const [ip, value] of attempts) {
      if (value.expiresAt <= now) attempts.delete(ip);
    }
    // 처음 요청한 IP라면 횟수 0, 만료 시각은 1분 뒤로 시작합니다.
    // 60_000의 밑줄은 읽기 편하게 넣은 것으로 숫자 60000과 같습니다.
    const attempt = attempts.get(req.ip) || { count: 0, expiresAt: now + 60_000 };
    attempt.count += 1;
    attempts.set(req.ip, attempt);
    if (attempt.count > 20) {
      // 429는 요청이 너무 많다는 뜻입니다. Retry-After에는 다시 시도할 때까지의 초를 보냅니다.
      res.setHeader("Retry-After", Math.ceil((attempt.expiresAt - now) / 1000));
      return res.status(429).json({ message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." });
    }
    next();
  }

  // 라우트는 '요청 방식 + 주소'에 처리 함수를 연결한 것입니다.
  // POST는 데이터를 보내 상태를 바꿀 때, GET은 데이터를 조회할 때 사용합니다.
  // 회원가입 흐름: 입력 검사 → 비밀번호 해시 생성 → 회원 저장 → 결과 응답.
  // limitAttempts가 먼저 실행되고, 통과한 요청만 그 뒤의 가입 함수에 도착합니다.
  app.post("/api/signup", limitAttempts, asyncRoute(async (req, res) => {
    const credentials = readCredentials(req.body);
    if (credentials.error) return res.status(400).json({ message: credentials.error });
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    if (!name || name.length > 30) {
      return res.status(400).json({ message: "이름은 1~30자로 입력해 주세요." });
    }
    // await는 해시 계산이나 파일 저장이 끝난 뒤 다음 줄을 진행하게 합니다.
    const passwordHash = await hashPassword(credentials.password);
    const user = await users.create({ name, email: credentials.email, passwordHash });
    // 저장 함수가 null을 반환하면 중복 이메일입니다. 409는 기존 데이터와의 충돌입니다.
    if (!user) return res.status(409).json({ message: "이미 가입된 이메일입니다." });
    // 201은 새 데이터 생성 성공입니다. 가입만 처리하며 로그인은 별도로 진행합니다.
    res.status(201).json({ message: "회원가입이 완료되었습니다. 로그인해 주세요.", user: publicUser(user) });
  }));

  // 로그인 흐름: 입력 검사 → 이메일로 회원 찾기 → 비밀번호 비교 → 세션 만들기.
  app.post("/api/login", limitAttempts, asyncRoute(async (req, res) => {
    const credentials = readCredentials(req.body);
    if (credentials.error) return res.status(400).json({ message: credentials.error });
    const user = await users.findByEmail(credentials.email);
    // ||는 왼쪽 조건이 참이면 오른쪽을 실행하지 않습니다.
    // 회원이 없을 때 user.passwordHash에 접근하는 에러도 이 순서로 피합니다.
    if (!user || !(await verifyPassword(credentials.password, user.passwordHash))) {
      // 401은 인증이 되지 않았다는 뜻입니다. 두 실패 원인에는 같은 안내를 사용합니다.
      return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }
    // 비밀번호 해시를 뺀 회원 정보만 세션에 넣고 브라우저에도 보냅니다.
    const safeUser = publicUser(user);
    sessions.create(req, res, safeUser);
    res.json({ message: "로그인되었습니다.", user: safeUser });
  }));

  // 브라우저가 보낸 쿠키를 세션과 대조해 현재 로그인한 회원을 알려줍니다.
  // 단순히 화면을 숨기는 것이 아니라, 서버에서 로그인 여부를 직접 판단합니다.
  app.get("/api/me", (req, res) => {
    const user = sessions.get(req);
    if (!user) return res.status(401).json({ message: "로그인이 필요합니다." });
    res.json({ user });
  });

  // 로그아웃은 회원 탈퇴와 다릅니다. 회원 파일은 두고 로그인 세션과 쿠키만 삭제합니다.
  app.post("/api/logout", (req, res) => {
    sessions.destroy(req, res);
    res.json({ message: "로그아웃되었습니다." });
  });

  // 정적 파일은 요청마다 새로 계산하지 않고 그대로 전달하는 HTML, CSS, JS 등입니다.
  // public 폴더만 공개하므로 src 코드나 data의 회원 파일은 이 경로로 제공되지 않습니다.
  app.use(express.static(publicDirectory));
  // 앞에서 응답한 라우트나 정적 파일이 없으면 마지막으로 404(주소 없음)를 보냅니다.
  app.use((req, res) => {
    res.status(404).json({ message: "요청한 주소를 찾을 수 없습니다." });
  });
  // 매개변수가 4개인 함수는 Express의 에러 처리 미들웨어입니다.
  // next(error)로 전달한 에러나 JSON 해석 오류가 이곳으로 들어옵니다.
  app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ message: "올바른 JSON 형식이 아닙니다." });
    }
    if (error.type === "entity.too.large") {
      return res.status(413).json({ message: "요청 데이터가 너무 큽니다." });
    }
    // 자세한 에러는 서버 터미널에 남기고 브라우저에는 일반적인 안내만 보냅니다.
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." });
  });
  // 아직 서버를 실행하지 않고 설정된 앱만 돌려줍니다. 실행은 server.js의 listen이 맡습니다.
  return app;
}
