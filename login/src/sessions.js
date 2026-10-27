// 쿠키: 브라우저가 보관하고 다음 요청에 함께 보내는 작은 값입니다.
// 세션: 그 값을 열쇠로 삼아 서버가 기억하는 로그인 정보입니다.
// 여기서는 브라우저에 임의 토큰만 주고, 회원 정보는 서버 메모리에 보관합니다.
import { randomBytes } from "node:crypto";

// 쿠키는 이름과 값의 쌍입니다. 예: login_session=임의토큰
const COOKIE_NAME = "login_session";
// 60초 × 60분 × 1,000밀리초 = 1시간. 로그인 순간부터 이 시간 동안 유효합니다.
const SESSION_DURATION = 60 * 60 * 1000;

export function createSessions({ secure = false } = {}) {
  // Map에 '토큰 → { 회원 정보, 만료 시각 }'을 저장합니다.
  // 파일에 저장하지 않으므로 서버가 재시작되면 로그인 상태는 초기화됩니다.
  const sessions = new Map();
  // httpOnly: 브라우저 JavaScript가 이 쿠키를 직접 읽지 못하게 합니다.
  // sameSite strict: 다른 사이트에서 시작한 요청에는 쿠키를 보내지 않도록 제한합니다.
  // secure: true일 때 HTTPS 연결에서만 전송합니다. path /는 이 사이트 전체 경로에 적용합니다.
  const cookieOptions = { httpOnly: true, sameSite: "strict", secure, path: "/" };

  function tokenFrom(req) {
    // Cookie 헤더는 '쿠키1=값1; 쿠키2=값2' 형태로 옵니다.
    // 세미콜론으로 나누고 공백을 제거한 뒤 로그인 쿠키만 찾습니다.
    const cookie = (req.headers.cookie || "").split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith(`${COOKIE_NAME}=`));
    // 'login_session=' 부분을 잘라 값만 반환합니다. 쿠키가 없으면 ?.에 의해 undefined입니다.
    return cookie?.slice(COOKIE_NAME.length + 1);
  }

  function removeExpired() {
    // 만료된 로그인 정보가 메모리에 계속 쌓이지 않도록 새 세션을 만들 때 정리합니다.
    for (const [token, session] of sessions) {
      if (session.expiresAt <= Date.now()) sessions.delete(token);
    }
  }

  return {
    create(req, res, user) {
      removeExpired();
      // 같은 브라우저의 이전 토큰은 지우고 새 토큰을 발급합니다.
      sessions.delete(tokenFrom(req));
      // 토큰은 서버가 무작위로 만드는 로그인 확인용 값입니다. 회원 ID나 비밀번호가 아닙니다.
      const token = randomBytes(32).toString("hex");
      sessions.set(token, { user, expiresAt: Date.now() + SESSION_DURATION });
      // res.cookie는 응답에 Set-Cookie 헤더를 붙입니다. 브라우저가 이를 받아 쿠키를 저장합니다.
      // ...cookieOptions는 기존 설정을 펼쳐 넣고 maxAge(쿠키 유지 시간)를 추가하는 문법입니다.
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: SESSION_DURATION });
    },
    get(req) {
      // 쿠키의 토큰이 서버의 Map에도 존재해야 로그인한 것으로 인정합니다.
      const token = tokenFrom(req);
      const session = sessions.get(token);
      if (!session) return null;
      // 쿠키가 남아 있더라도 서버가 기록한 만료 시각을 지났으면 로그인을 인정하지 않습니다.
      if (session.expiresAt <= Date.now()) {
        sessions.delete(token);
        return null;
      }
      return session.user;
    },
    destroy(req, res) {
      // 서버의 기록을 지워 기존 토큰을 무효화하고, 브라우저에도 쿠키 삭제를 지시합니다.
      // 쿠키만 지우면 복사해 둔 토큰은 유효할 수 있으므로 양쪽 모두 처리합니다.
      sessions.delete(tokenFrom(req));
      res.clearCookie(COOKIE_NAME, cookieOptions);
    }
  };
}
