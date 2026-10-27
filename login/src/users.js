// 이 파일은 '회원 정보를 어디에, 어떤 형태로 저장할까?'를 담당합니다.
// node:로 시작하는 모듈은 Node.js에 기본으로 들어 있어 따로 설치하지 않아도 됩니다.
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { promisify } from "node:util";

// scrypt는 원래 완료 후 함수를 호출하는 방식입니다.
// promisify로 Promise를 반환하게 바꾸면 아래에서 await를 사용할 수 있습니다.
const scrypt = promisify(scryptCallback);

// 해시는 비밀번호로부터 계산한 값이며, 복호화해서 원래 비밀번호를 꺼내는 방식이 아닙니다.
// salt는 사용자마다 새로 만드는 임의의 값입니다. 같은 비밀번호도 다른 해시가 나게 합니다.
// salt는 나중에 비교할 때 다시 필요하므로 해시와 함께 저장합니다.
export async function hashPassword(password) {
  // randomBytes(16)는 임의의 16바이트, hex는 그 데이터를 16진수 문자열로 표현하는 방식입니다.
  const salt = randomBytes(16).toString("hex");
  // scrypt는 비밀번호 해시에 쓰는 계산법입니다. 마지막 인수 64는 결과의 바이트 길이입니다.
  const hash = await scrypt(password, salt, 64);
  // 예: 'salt문자열:해시문자열'. 콜론을 기준으로 나누면 두 값을 다시 얻을 수 있습니다.
  return `${salt}:${hash.toString("hex")}`;
}

// 로그인할 때 입력한 비밀번호를, 저장했던 salt로 다시 해시하여 결과를 비교합니다.
// 저장한 비밀번호를 복원해서 비교하는 것이 아닙니다.
export async function verifyPassword(password, storedPassword) {
  const [salt, hash] = storedPassword.split(":");
  const actual = await scrypt(password, salt, 64);
  // Buffer는 문자열 표현이 아닌 실제 바이트 데이터를 다루는 Node.js 객체입니다.
  const expected = Buffer.from(hash, "hex");
  // timingSafeEqual은 같은 길이의 데이터를 비교할 때 값에 따른 처리 시간 차이를 줄입니다.
  // 이 함수는 길이가 다르면 에러가 나므로 먼저 길이를 검사합니다.
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// 저장된 회원 객체에는 passwordHash도 있습니다. 필요한 항목만 새 객체로 골라 보내서
// 브라우저에 비밀번호 해시가 노출되지 않게 합니다.
export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

// 파일 경로를 받아 회원 조회와 생성 함수를 묶어서 반환합니다.
// 내부 함수들은 이 함수가 끝난 뒤에도 filePath와 pendingWrite를 기억합니다(클로저).
export function createUserStore(filePath) {
  // 동시에 가입해도 이전 저장이 끝난 뒤 다음 저장을 실행합니다.
  // 각각 옛 목록을 읽고 덮어쓰면 한 회원이 사라질 수 있으므로 저장 작업을 줄 세웁니다.
  let pendingWrite = Promise.resolve();

  async function readUsers() {
    try {
      // 파일의 JSON 문자열을 JavaScript 배열로 바꿉니다. utf8은 한글을 읽는 문자 인코딩입니다.
      return JSON.parse(await readFile(filePath, "utf8"));
    } catch (error) {
      // ENOENT는 파일이 없다는 뜻입니다. 첫 실행에는 가입한 회원이 없으므로 빈 배열로 봅니다.
      if (error.code === "ENOENT") return [];
      // 파일 손상이나 권한 오류는 빈 목록으로 덮지 않고 호출한 쪽에 전달합니다.
      throw error;
    }
  }

  return {
    async findByEmail(email) {
      const users = await readUsers();
      // find는 조건에 맞는 첫 회원을 반환하고, 없으면 undefined를 반환합니다.
      return users.find((user) => user.email === email);
    },
    create({ name, email, passwordHash }) {
      // then 안의 함수는 앞선 저장이 끝나야 실행됩니다. 파일을 읽는 작업도 이 안에 둡니다.
      const operation = pendingWrite.then(async () => {
        const users = await readUsers();
        // some은 조건에 맞는 항목이 하나라도 있으면 true입니다. 중복이면 저장하지 않습니다.
        if (users.some((user) => user.email === email)) return null;

        // 이메일과 별개로 회원을 식별할 임의의 고유 ID를 만듭니다.
        const user = { id: randomUUID(), name, email, passwordHash };
        // data 폴더가 없으면 생성합니다. recursive 옵션은 이미 있는 폴더도 허용합니다.
        await mkdir(dirname(filePath), { recursive: true });
        // 임시 파일을 완성한 뒤 교체해 저장 중 원본이 잘리는 일을 방지합니다.
        // [...users, user]는 기존 회원 뒤에 새 회원을 붙인 배열입니다.
        // stringify는 객체를 JSON 문자열로 바꾸며, null, 2는 읽기 편한 2칸 들여쓰기 설정입니다.
        await writeFile(`${filePath}.tmp`, JSON.stringify([...users, user], null, 2), "utf8");
        await rename(`${filePath}.tmp`, filePath);
        return user;
      });
      // 한 번 저장에 실패해도 다음 가입 시도는 실행될 수 있도록 대기열의 실패를 처리합니다.
      // 호출자에게는 원래 operation을 반환하므로 현재 저장의 에러는 여전히 전달됩니다.
      pendingWrite = operation.catch(() => {});
      return operation;
    }
  };
}
