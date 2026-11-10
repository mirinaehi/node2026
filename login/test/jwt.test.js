import assert from "node:assert/strict";
import { request as httpRequest } from "node:http";
import test from "node:test";
import jwt from "jsonwebtoken";
import { createJwtApp } from "../jwt.js";

const secret = "jwt-classroom-test-signing-secret";

// 회원 파일을 사용하지 않고, 임시 포트에서 JWT 발급과 접근 권한을 확인합니다.
async function fixture(t, signingKey = secret) {
  const server = createJwtApp({ secret: signingKey }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  function request(path, cookie) {
    return new Promise((resolve, reject) => {
      const req = httpRequest({
        host: "127.0.0.1", port: server.address().port, path,
        headers: cookie ? { Cookie: cookie } : {}
      }, (res) => {
        let text = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => { text += chunk; });
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, text }));
      });
      req.on("error", reject);
      req.end();
    });
  }

  return request;
}

test("학생 로그인, JWT 쿠키 발급과 관리자 권한 제한", async (t) => {
  const request = await fixture(t);
  assert.equal((await request("/mypage")).status, 401);
  assert.equal((await request("/admin")).status, 401);
  const failed = await request("/login?id=student01&pw=wrong");
  assert.equal(failed.status, 401);
  assert.equal(failed.headers["set-cookie"], undefined);
  assert.equal((await request("/login?id=unknown&pw=1234")).status, 401);
  assert.equal((await request("/login?id=toString")).status, 401);

  const login = await request("/login?id=student01&pw=1234");
  assert.equal(login.status, 200);
  const setCookie = login.headers["set-cookie"][0];
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Lax/);
  assert.match(setCookie, /Max-Age=1800/);
  const cookie = setCookie.split(";")[0];
  const token = cookie.slice("access_token=".length);
  const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
  assert.equal(payload.userId, "student01");
  assert.equal(payload.role, "student");
  assert.equal(payload.exp - payload.iat, 1800);
  assert.equal(payload.password, undefined);
  assert.equal(payload.pw, undefined);
  assert.match((await request("/mypage", cookie)).text, /student01/);
  assert.equal((await request("/admin", cookie)).status, 403);
});

test("관리자 접근과 로그아웃: 쿠키는 삭제하고 기존 JWT는 만료까지 유지", async (t) => {
  const request = await fixture(t);
  const login = await request("/login?id=admin&pw=admin1234");
  const cookie = login.headers["set-cookie"][0].split(";")[0];
  assert.equal((await request("/admin", cookie)).status, 200);

  const logout = await request("/logout", cookie);
  assert.equal(logout.status, 200);
  assert.match(logout.headers["set-cookie"][0], /access_token=;/);
  assert.match(logout.headers["set-cookie"][0], /Expires=Thu, 01 Jan 1970/);
  assert.equal((await request("/mypage")).status, 401);
  assert.equal((await request("/mypage", cookie)).status, 200);
});

test("권한 변조, 만료, 잘못된 키와 서명 없는 토큰 거절", async (t) => {
  const request = await fixture(t);
  const login = await request("/login?id=student01&pw=1234");
  const cookie = login.headers["set-cookie"][0].split(";")[0];
  const parts = cookie.slice("access_token=".length).split(".");
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  parts[1] = Buffer.from(JSON.stringify({ ...payload, role: "admin" })).toString("base64url");

  const expired = jwt.sign({ userId: "admin", role: "admin" }, secret, { expiresIn: -1, algorithm: "HS256" });
  const wrongKey = jwt.sign({ userId: "admin", role: "admin" }, "another-key", { expiresIn: "30m" });
  const unsigned = jwt.sign({ userId: "admin", role: "admin" }, null, { algorithm: "none" });
  for (const token of [parts.join("."), expired, wrongKey, unsigned, "not-a-jwt"]) {
    assert.equal((await request("/admin", `access_token=${token}`)).status, 401);
  }
});

test("같은 서명 키를 쓰는 새 앱에서도 JWT 확인 가능", async (t) => {
  const first = await fixture(t);
  const second = await fixture(t);
  const differentKey = await fixture(t, "different-server-key");
  const login = await first("/login?id=student01&pw=1234");
  const cookie = login.headers["set-cookie"][0].split(";")[0];
  assert.equal((await second("/mypage", cookie)).status, 200);
  assert.equal((await differentKey("/mypage", cookie)).status, 401);
});
