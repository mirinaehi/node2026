import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// 원래 비밀번호 대신 해시를 저장합니다. salt를 섞으면 같은 비밀번호도 다른 해시가 됩니다.
export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64);
  return `${salt}:${hash.toString("hex")}`;
}

// 저장했던 salt로 입력 비밀번호를 다시 해시하여 비교합니다. 비밀번호를 복원하지 않습니다.
export function verifyPassword(password, storedPassword) {
  const [salt, hash] = storedPassword.split(":");
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// 브라우저에 보낼 항목만 골라 비밀번호 해시가 응답에 포함되지 않게 합니다.
export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

// 파일이 없으면 빈 목록을 준비하고, 저장된 JSON을 회원 배열로 읽습니다.
export function readUsers(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
  if (!existsSync(filePath)) writeFileSync(filePath, "[]", "utf8");
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function findByEmail(email, filePath) {
  const users = readUsers(filePath);
  return users.find((user) => user.email === email);
}

// 파일 읽기 → 중복 확인 → 회원 추가 → 파일 저장 순서로 처리합니다.
export function createUser({ name, email, passwordHash }, filePath) {
  const users = readUsers(filePath);
  if (users.some((user) => user.email === email)) return null;

  // id: randomUUID()는 새 회원 객체의 id 속성에 임의로 생성한 UUID 문자열을 넣는 코드입니다.
  // randomUUID는 위에서 가져온 Node.js의 기본 함수로, 호출할 때마다 새로운 값을 만듭니다.
  // 예를 들어 "550e8400-e29b-41d4-a716-446655440000"처럼 하이픈이 포함된 문자열이 나옵니다.
  // UUID는 서로 다른 데이터에 같은 값이 붙을 가능성이 매우 낮도록 설계된 식별자입니다.
  // 회원의 이름은 다른 사람과 같을 수 있고, 이메일은 나중에 변경될 수도 있습니다.
  // 그래서 회원을 계속 같은 사람으로 구분할 수 있도록 별도의 id를 저장합니다.
  // 가입할 때 한 번 만든 id를 파일에 함께 저장하며, 로그인할 때는 저장된 id를 그대로 사용합니다.
  // 나중에 게시글이나 댓글을 추가하면 작성자의 이름 대신 이 id를 기록해 회원과 연결할 수 있습니다.
  // 배열에서 몇 번째에 있는지를 id로 쓰면 삭제나 정렬에 따라 번호가 달라질 수 있습니다.
  // randomUUID를 쓰면 새 회원마다 다음 번호를 계산하지 않고도 별도의 식별자를 만들 수 있습니다.
  // 이 값은 회원을 구분하는 용도이며, 로그인 확인에 쓰는 비밀번호나 세션 토큰과는 역할이 다릅니다.
  const user = { id: randomUUID(), name, email, passwordHash };
  writeFileSync(filePath, JSON.stringify([...users, user], null, 2), "utf8");
  return user;
}
