# 회원가입과 로그인

회원가입과 로그인의 원리를 익히는 Express 예제입니다. 이름, 이메일, 비밀번호로 가입하고 로그인·로그아웃을 할 수 있습니다.

## 실행

```powershell
cd C:\dev\node2026\login
npm install
npm start
```

브라우저에서 `http://localhost:5100`을 엽니다. 포트는 `PORT` 환경 변수로 바꿀 수 있습니다.

정적 파일과 회원 파일은 `C:/dev/node2026/login/public`, `C:/dev/node2026/login/data/users.json`이라는 절대 경로로 지정했습니다. 상위 폴더에서 `node login/server.js`로 실행해도 같은 파일을 찾습니다. 프로젝트를 다른 위치로 옮기면 `src/app.js`에 적힌 두 경로를 수정합니다.

## 핵심 흐름

1. **회원가입**: 비밀번호 해시 생성 → 회원 정보를 JSON 파일에 저장합니다.
2. **로그인**: 이메일로 회원 찾기 → 입력한 비밀번호의 해시 비교 → 세션과 쿠키를 만듭니다.
3. **로그인 유지**: 브라우저가 쿠키의 토큰을 보내면 서버가 세션에서 회원을 확인합니다.
4. **로그아웃**: 서버 세션과 브라우저 쿠키를 삭제합니다.

브라우저에는 임의 토큰을, 서버 메모리에는 해당 토큰의 회원 정보와 만료 시각을 저장합니다. 새로고침 후에도 `/api/me`로 로그인 상태를 확인합니다. 세션은 로그인 후 1시간 동안 유효하며, 서버 재시작 시 초기화됩니다.

## 코드 읽는 순서

| 파일 | 역할 |
| --- | --- |
| `server.js` | 서버 실행 |
| `src/app.js` | 회원가입·로그인 API |
| `src/users.js` | 비밀번호 해시 생성·비교와 회원 파일 저장 |
| `src/sessions.js` | 쿠키의 토큰과 서버 세션 연결 |
| `public/app.js` | 입력값 전송과 결과 표시 |
| `public/index.html` | 회원가입·로그인 폼 |
| `public/style.css` | 기본 화면 스타일 |

`src/users.js`의 파일 저장과 비밀번호 해시 계산은 동기 함수를 사용합니다. 브라우저의 서버 요청은 `async/await`로 응답을 기다립니다.

회원 파일 관련 코드는 `readUsers(filePath)`, `findByEmail(email, filePath)`, `createUser(회원정보, filePath)`라는 독립 함수로 나누었습니다. API에서 필요한 함수를 직접 호출하며, 각 함수에 회원 파일 경로를 전달합니다.

세션 코드도 `createSession()`, `getSession()`, `destroySession()`이라는 독립 함수로 나누었습니다. `src/app.js`에서 만든 `Map`을 각 함수에 전달하여 로그인 기록을 생성·조회·삭제합니다.

핵심 흐름에 집중하기 위해 별도의 API 공통 미들웨어와 직접 작성한 예외 처리는 생략했습니다. 중복 가입, 비밀번호 불일치, 미로그인 여부는 인증에 필요한 조건으로 남겨두었습니다.

## API

| 메서드 | 주소 | 요청 / 동작 |
| --- | --- | --- |
| POST | `/api/signup` | `{ "name": "홍길동", "email": "hello@example.com", "password": "password123" }` |
| POST | `/api/login` | `{ "email": "hello@example.com", "password": "password123" }` |
| GET | `/api/me` | 현재 회원 조회, 미로그인은 401 |
| POST | `/api/logout` | `{}`를 보내 로그아웃 |

POST 요청은 `Content-Type: application/json`을 사용합니다. 입력한 이름, 이메일, 비밀번호를 그대로 받아 처리하며 필수 입력·형식·길이 검사는 생략합니다. 이메일도 입력한 문자열 그대로 저장하고 비교합니다. 비밀번호는 사용자별 salt와 `crypto.scryptSync`로 해시하며 응답에는 해시를 포함하지 않습니다.

회원 파일 `data/users.json`은 처음 읽을 때 없으면 빈 목록으로 생성되며 Git에서 제외됩니다. 쿠키에는 `HttpOnly`, `SameSite=Strict`를 적용합니다. `NODE_ENV=production`에서는 `Secure`도 적용되어 HTTPS에서만 쿠키가 전달됩니다.

이 프로젝트는 로컬 학습용 단일 서버 예제입니다. 실제 서비스에서는 데이터베이스, 공유 세션 저장소, HTTPS와 요청 횟수 제한 등을 별도로 구성해야 합니다.

## 테스트

```powershell
npm test
```

임시 파일과 임시 서버로 인증 동작을 확인하고 종료합니다. 실제 회원 데이터에는 영향을 주지 않습니다.
