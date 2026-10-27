import { randomBytes } from "node:crypto";

const COOKIE_NAME = "login_session";
const SESSION_DURATION = 60 * 60 * 1000;
const cookieOptions = { httpOnly: true, sameSite: "strict", path: "/" };

function tokenFrom(req) {
  const cookie = (req.headers.cookie || "").split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${COOKIE_NAME}=`));
  return cookie?.slice(COOKIE_NAME.length + 1);
}

// 서버의 Map에 로그인 정보를 저장하고, 브라우저에는 토큰을 쿠키로 보냅니다.
export function createSession(sessions, req, res, user, secure = false) {
  for (const [token, session] of sessions) {
    if (session.expiresAt <= Date.now()) sessions.delete(token);
  }
  sessions.delete(tokenFrom(req));
  const token = randomBytes(32).toString("hex");
  sessions.set(token, { user, expiresAt: Date.now() + SESSION_DURATION });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, secure, maxAge: SESSION_DURATION });
}

// 쿠키의 토큰으로 Map을 조회합니다. 세션이 존재하고 만료되지 않아야 회원을 반환합니다.
export function getSession(sessions, req) {
  const token = tokenFrom(req);
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session.user;
}

// 서버의 기록과 브라우저의 쿠키를 모두 지워 기존 토큰도 사용할 수 없게 합니다.
export function destroySession(sessions, req, res, secure = false) {
  sessions.delete(tokenFrom(req));
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, secure });
}
