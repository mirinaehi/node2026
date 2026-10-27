# 회원가입과 로그인

기존 예제와 같은 Express + ES Module 방식으로 회원가입과 로그인만 연습하는 프로젝트입니다.
별도 데이터베이스 설정 없이 실행할 수 있습니다.

## 실행

```powershell
cd C:\dev\node2026\login
npm install
npm start
```

브라우저에서 `http://localhost:5100`을 엽니다. 포트 변경은 실행 전에 `$env:PORT = "5200"`으로 설정합니다.

1. **회원가입**에서 이름, 이메일, 비밀번호, 비밀번호 확인을 입력합니다.
2. 가입 후 **로그인**에서 같은 이메일과 비밀번호를 입력합니다.
3. 로그인한 이름과 이메일이 표시됩니다. 새로고침해도 로그인 상태가 유지됩니다.
4. **로그아웃**하면 다시 로그인 화면으로 돌아옵니다.

## 파일 구성

```text
login/
  server.js          서버 시작 (기본 포트 5100)
  src/app.js         Express 설정, 입력 검사, 인증 API
  src/users.js       회원 JSON 저장과 비밀번호 해시 비교
  src/sessions.js    서버 메모리의 세션과 쿠키 관리
  public/index.html  로그인 / 회원가입 화면
  public/style.css   화면 스타일
  public/app.js      fetch 요청과 화면 변경
  test/auth.test.js  실제 HTTP 요청으로 인증 동작 검증
  data/users.json    첫 회원가입 시 자동 생성 (Git 제외)
```

## API

| 메서드 | 주소 | 요청 / 동작 |
| --- | --- | --- |
| POST | `/api/signup` | `{ "name": "홍길동", "email": "hello@example.com", "password": "password123" }` |
| POST | `/api/login` | `{ "email": "hello@example.com", "password": "password123" }` |
| GET | `/api/me` | 쿠키로 로그인한 회원 조회. 미로그인은 401 |
| POST | `/api/logout` | `{}`를 전송해 세션과 쿠키 삭제 |

POST 요청은 `Content-Type: application/json`을 사용합니다. 비밀번호 확인은 화면에서 검사하고, 서버는 이름 1~30자, 이메일 형식, 비밀번호 8~128자를 검사합니다. 이메일 앞뒤 공백과 대소문자는 정규화하며 중복 가입은 409로 응답합니다.

비밀번호는 Node.js `crypto.scrypt`와 사용자별 임의 salt로 해시하여 저장합니다. API 응답에 비밀번호 해시를 포함하지 않습니다. 로그인 시 임의 세션 토큰을 `HttpOnly`, `SameSite=Strict` 쿠키로 전달하고 세션은 1시간 뒤 만료됩니다. 회원가입과 로그인 요청은 IP당 1분에 합계 20회까지 받습니다.

학습용 단일 서버 예제입니다. 회원 데이터는 서버 재시작 후에도 유지되지만 메모리에 있는 로그인 세션은 초기화됩니다. JSON 저장은 한 서버 프로세스에서만 사용하세요. 실제 서비스 배포에는 HTTPS, 데이터베이스, 공유 세션 저장소가 필요합니다. `NODE_ENV=production`에서는 쿠키에 `Secure`가 적용되어 HTTPS에서만 전달됩니다.

## 테스트

```powershell
npm test
```

테스트는 임시 폴더에 회원 데이터를 저장하므로 실제 가입한 회원 데이터에 영향을 주지 않습니다.
