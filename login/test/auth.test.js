import assert from "node:assert/strict";
import { request as httpRequest } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createApp } from "../src/app.js";

const account = { name: "테스트", email: "hello@example.com", password: "password123" };

// 실제 회원 파일 대신 임시 파일과 임시 포트로 검증하고, 테스트가 끝나면 정리합니다.
async function fixture(t, options = {}) {
  const directory = await mkdtemp(join(tmpdir(), "login-test-"));
  const usersFile = options.usersFile || join(directory, "users.json");
  const server = createApp({ usersFile, ...options }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await rm(directory, { recursive: true, force: true });
  });

  function request(path, { method = "GET", body, cookie } = {}) {
    return new Promise((resolve, reject) => {
      const headers = {};
      if (body !== undefined) headers["Content-Type"] = "application/json";
      if (cookie) headers.Cookie = cookie;
      const req = httpRequest({ host: "127.0.0.1", port: server.address().port, path, method, headers }, (res) => {
        let text = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => { text += chunk; });
        res.on("end", () => resolve({
          status: res.statusCode,
          headers: res.headers,
          text,
          data: res.headers["content-type"]?.includes("application/json") ? JSON.parse(text) : null
        }));
      });
      req.on("error", reject);
      req.end(body === undefined ? undefined : JSON.stringify(body));
    });
  }
  return { request, usersFile };
}

test("가입 → 로그인 → 현재 회원 조회 → 로그아웃 시 세션 무효화", async (t) => {
  const { request, usersFile } = await fixture(t);
  assert.equal((await request("/api/me")).status, 401);

  const signup = await request("/api/signup", { method: "POST", body: account });
  assert.equal(signup.status, 201);
  assert.equal(signup.data.user.name, account.name);
  assert.deepEqual(Object.keys(signup.data.user).sort(), ["email", "id", "name"]);
  assert.equal((await request("/api/me")).status, 401);

  const [stored] = JSON.parse(await readFile(usersFile, "utf8"));
  assert.ok(stored.passwordHash);
  assert.ok(!JSON.stringify(stored).includes(account.password));
  assert.equal(stored.password, undefined);

  const login = await request("/api/login", { method: "POST", body: account });
  assert.equal(login.status, 200);
  const setCookie = login.headers["set-cookie"][0];
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);
  assert.match(setCookie, /Max-Age=3600/);
  const cookie = setCookie.split(";")[0];
  const me = await request("/api/me", { cookie });
  assert.equal(me.status, 200);
  assert.deepEqual(me.data.user, signup.data.user);
  assert.equal((await request("/api/me", { cookie: "login_session=forged" })).status, 401);

  const relogin = await request("/api/login", { method: "POST", body: account, cookie });
  const newCookie = relogin.headers["set-cookie"][0].split(";")[0];
  assert.notEqual(cookie, newCookie);
  assert.equal((await request("/api/me", { cookie })).status, 401);
  const logout = await request("/api/logout", { method: "POST", body: {}, cookie: newCookie });
  assert.equal(logout.status, 200);
  assert.match(logout.headers["set-cookie"][0], /Expires=Thu, 01 Jan 1970/);
  assert.equal((await request("/api/me", { cookie: newCookie })).status, 401);
});

test("중복 가입과 잘못된 비밀번호", async (t) => {
  const { request } = await fixture(t);
  const created = await request("/api/signup", { method: "POST", body: account });
  assert.equal(created.status, 201);
  assert.equal(created.data.user.email, account.email);
  assert.equal((await request("/api/signup", { method: "POST", body: account })).status, 409);
  for (const body of [{ ...account, password: "wrong-password" }, { ...account, email: "unknown@example.com" }]) {
    const response = await request("/api/login", { method: "POST", body });
    assert.equal(response.status, 401);
    assert.equal(response.headers["set-cookie"], undefined);
    assert.equal(response.data.message, "이메일 또는 비밀번호가 올바르지 않습니다.");
  }
});

test("동시에 가입해도 중복이나 데이터 유실 없이 파일에 저장", async (t) => {
  const { request, usersFile } = await fixture(t);
  const results = await Promise.all([
    request("/api/signup", { method: "POST", body: account }),
    request("/api/signup", { method: "POST", body: account }),
    request("/api/signup", { method: "POST", body: { ...account, email: "second@example.com" } })
  ]);
  assert.deepEqual(results.map((result) => result.status).sort(), [201, 201, 409]);
  const saved = JSON.parse(await readFile(usersFile, "utf8"));
  assert.equal(saved.length, 2);
  assert.notEqual(saved[0].passwordHash, saved[1].passwordHash);
  const restarted = await fixture(t, { usersFile });
  const login = await restarted.request("/api/login", { method: "POST", body: account });
  assert.equal(login.status, 200);
  assert.equal(login.data.user.email, account.email);
});

test("정적 파일 제공과 비공개 데이터 경로", async (t) => {
  const { request } = await fixture(t);
  assert.equal((await request("/")).status, 200);
  assert.equal((await request("/style.css")).status, 200);
  assert.equal((await request("/app.js")).status, 200);
  for (const path of ["/data/users.json", "/src/users.js", "/missing"]) {
    assert.equal((await request(path)).status, 404);
  }
});

test("HTTPS 설정에서는 Secure 쿠키 발급", async (t) => {
  const { request } = await fixture(t, { secureCookies: true });
  await request("/api/signup", { method: "POST", body: account });
  const login = await request("/api/login", { method: "POST", body: account });
  assert.match(login.headers["set-cookie"][0], /; Secure/);
});

test("서로 다른 앱 사이에서 로그인 세션을 공유하지 않음", async (t) => {
  const first = await fixture(t);
  const second = await fixture(t);
  await first.request("/api/signup", { method: "POST", body: account });
  const login = await first.request("/api/login", { method: "POST", body: account });
  const cookie = login.headers["set-cookie"][0].split(";")[0];
  assert.equal((await first.request("/api/me", { cookie })).status, 200);
  assert.equal((await second.request("/api/me", { cookie })).status, 401);
});
