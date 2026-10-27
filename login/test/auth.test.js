// 테스트는 '기대하는 결과'와 '실제 결과'를 비교해 기능을 자동으로 확인하는 코드입니다.
// node:test가 테스트를 실행하고, assert가 두 결과가 다를 때 실패를 알립니다.
// 이 파일은 브라우저 대신 직접 HTTP 요청을 보내 서버의 동작을 확인합니다.
import assert from "node:assert/strict";
import { request as httpRequest } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createApp } from "../src/app.js";

// 실제 회원과 무관한 테스트용 입력값입니다.
const account = { name: "테스트", email: "hello@example.com", password: "password123" };

// fixture는 테스트에 필요한 임시 서버와 파일을 준비하는 보조 함수입니다.
async function fixture(t, options = {}) {
  // 매번 별도의 임시 폴더를 만들어 실제 data/users.json에 영향을 주지 않습니다.
  const directory = await mkdtemp(join(tmpdir(), "login-test-"));
  const usersFile = options.usersFile || join(directory, "users.json");
  // 포트 0은 운영체제에 사용 가능한 포트를 골라 달라는 뜻입니다. 127.0.0.1은 내 컴퓨터입니다.
  const server = createApp({ usersFile, ...options }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  // t.after는 테스트가 성공하든 실패하든 끝난 뒤 서버와 임시 파일을 정리합니다.
  t.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await rm(directory, { recursive: true, force: true });
  });

  // 실제 HTTP 요청을 보내고 상태 코드, 헤더, 본문을 하나의 결과 객체로 돌려줍니다.
  function request(path, { method = "GET", body, cookie, raw, contentType = "application/json" } = {}) {
    return new Promise((resolve, reject) => {
      const headers = {};
      if (body !== undefined || raw !== undefined) headers["Content-Type"] = contentType;
      // 이 테스트 도구에는 브라우저의 쿠키 자동 저장 기능이 없어 직접 헤더에 넣습니다.
      if (cookie) headers.Cookie = cookie;
      const req = httpRequest({ host: "127.0.0.1", port: server.address().port, path, method, headers }, (res) => {
        let text = "";
        res.setEncoding("utf8");
        // HTTP 본문은 여러 조각으로 도착할 수 있어 data에서 모으고 end에서 결과를 완성합니다.
        res.on("data", (chunk) => { text += chunk; });
        res.on("end", () => resolve({
          status: res.statusCode,
          headers: res.headers,
          text,
          data: res.headers["content-type"]?.includes("application/json") ? JSON.parse(text) : null
        }));
      });
      req.on("error", reject);
      req.end(raw ?? (body === undefined ? undefined : JSON.stringify(body)));
    });
  }
  return { request, usersFile };
}

test("가입 → 로그인 → 현재 회원 조회 → 로그아웃 시 세션 무효화", async (t) => {
  const { request, usersFile } = await fixture(t);
  assert.equal((await request("/api/me")).status, 401);

  const signup = await request("/api/signup", { method: "POST", body: account });
  // assert.equal은 값의 일치, deepEqual은 객체나 배열 내부 내용의 일치까지 검사합니다.
  assert.equal(signup.status, 201);
  assert.equal(signup.data.user.name, account.name);
  assert.deepEqual(Object.keys(signup.data.user).sort(), ["email", "id", "name"]);
  assert.equal((await request("/api/me")).status, 401);

  // 화면에 안 보이는 것뿐 아니라 저장 파일에도 원래 비밀번호가 없는지 확인합니다.
  const [stored] = JSON.parse(await readFile(usersFile, "utf8"));
  assert.ok(stored.passwordHash);
  assert.ok(!JSON.stringify(stored).includes(account.password));
  assert.equal(stored.password, undefined);

  const login = await request("/api/login", { method: "POST", body: account });
  assert.equal(login.status, 200);
  // Set-Cookie는 '브라우저에 저장하라'는 응답 헤더입니다.
  // 다음 요청에는 옵션을 뺀 '쿠키이름=값' 부분만 Cookie 헤더로 돌려보냅니다.
  const setCookie = login.headers["set-cookie"][0];
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);
  assert.match(setCookie, /Max-Age=3600/);
  const cookie = setCookie.split(";")[0];
  const me = await request("/api/me", { cookie });
  assert.equal(me.status, 200);
  assert.deepEqual(me.data.user, signup.data.user);
  assert.equal(me.headers["cache-control"], "no-store");
  assert.equal((await request("/api/me", { cookie: "login_session=forged" })).status, 401);

  // 다시 로그인하면 새 토큰이 생기고 이전 토큰으로는 접근할 수 없어야 합니다.
  const relogin = await request("/api/login", { method: "POST", body: account, cookie });
  const newCookie = relogin.headers["set-cookie"][0].split(";")[0];
  assert.notEqual(cookie, newCookie);
  assert.equal((await request("/api/me", { cookie })).status, 401);
  const logout = await request("/api/logout", { method: "POST", body: {}, cookie: newCookie });
  assert.equal(logout.status, 200);
  assert.match(logout.headers["set-cookie"][0], /Expires=Thu, 01 Jan 1970/);
  // 로그아웃 뒤에도 옛 쿠키를 일부러 보내 서버에서 실제로 무효화했는지 확인합니다.
  assert.equal((await request("/api/me", { cookie: newCookie })).status, 401);
});

test("입력 검사, 이메일 정규화, 중복 가입과 잘못된 비밀번호", async (t) => {
  const { request } = await fixture(t);
  for (const body of [null, {}, { ...account, name: " " }, { ...account, email: "invalid" }, { ...account, password: "short" }, { ...account, password: "a".repeat(129) }]) {
    assert.equal((await request("/api/signup", { method: "POST", body })).status, 400);
  }
  const created = await request("/api/signup", { method: "POST", body: { ...account, email: "  HELLO@EXAMPLE.COM  " } });
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
  // Promise.all로 요청들을 겹쳐 실행해 동시에 파일을 수정하는 상황을 재현합니다.
  const results = await Promise.all([
    request("/api/signup", { method: "POST", body: account }),
    request("/api/signup", { method: "POST", body: account }),
    request("/api/signup", { method: "POST", body: { ...account, email: "second@example.com" } })
  ]);
  // 완료 순서는 보장되지 않으므로 상태 코드를 정렬한 뒤 성공 2건과 중복 1건을 확인합니다.
  assert.deepEqual(results.map((result) => result.status).sort(), [201, 201, 409]);
  const saved = JSON.parse(await readFile(usersFile, "utf8"));
  assert.equal(saved.length, 2);
  assert.notEqual(saved[0].passwordHash, saved[1].passwordHash);
  // 같은 파일을 사용하는 새 앱에서도 로그인되면 회원 정보가 메모리가 아닌 파일에 남은 것입니다.
  const restarted = await fixture(t, { usersFile });
  const login = await restarted.request("/api/login", { method: "POST", body: account });
  assert.equal(login.status, 200);
  assert.equal(login.data.user.email, account.email);
});

test("JSON 오류, 크기 제한, 정적 파일과 비공개 데이터 경로", async (t) => {
  const { request } = await fixture(t);
  assert.equal((await request("/")).status, 200);
  assert.equal((await request("/style.css")).status, 200);
  assert.equal((await request("/app.js")).status, 200);
  for (const path of ["/data/users.json", "/src/users.js", "/missing"]) {
    assert.equal((await request(path)).status, 404);
  }
  assert.equal((await request("/api/login", { method: "POST", raw: "{" })).status, 400);
  assert.equal((await request("/api/login", { method: "POST", raw: "email=a", contentType: "application/x-www-form-urlencoded" })).status, 415);
  assert.equal((await request("/api/login", { method: "POST", body: { text: "x".repeat(11_000) } })).status, 413);
});

test("인증 요청을 IP당 1분 20회로 제한", async (t) => {
  const { request } = await fixture(t);
  for (let count = 0; count < 20; count += 1) {
    assert.equal((await request("/api/login", { method: "POST", body: {} })).status, 400);
  }
  const limited = await request("/api/signup", { method: "POST", body: account });
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers["retry-after"]) > 0);
});

test("HTTPS 설정에서는 Secure 쿠키 발급", async (t) => {
  const { request } = await fixture(t, { secureCookies: true });
  await request("/api/signup", { method: "POST", body: account });
  const login = await request("/api/login", { method: "POST", body: account });
  assert.match(login.headers["set-cookie"][0], /; Secure/);
});
