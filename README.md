# Node.js 기초 쌓기

이 저장소는 같은 기능을 두 방식으로 나란히 만들어 보면서 Node.js의 기본기와 Express의 편리함을 천천히 익히기 위한 연습 공간입니다.

## 폴더 구성

```text
01-basics/
  pure-node/   Node.js 기본 모듈만 사용하는 예제
  express/     Express를 사용하는 같은 기능의 예제
02-file-read/
  pure-node/   파일을 직접 읽어 JSON 응답을 만드는 예제
  express/     Express 라우팅과 res.json으로 같은 기능을 만드는 예제
03-html-file/
  pure-node/   HTML 파일을 직접 읽어서 브라우저에 보내는 예제
  express/     Express의 sendFile로 같은 HTML 파일 응답을 만드는 예제
04-express-static/
  public/      express.static()으로 제공할 HTML, CSS, JS, 이미지 파일
  server.js    Express 정적 파일 서버 예제
05-express-fetch-api/
  data/        API가 읽을 JSON 데이터 파일
  public/      fetch()로 API를 호출하는 정적 프론트 파일
  server.js    정적 파일 제공과 API 라우트를 함께 쓰는 Express 예제
06-express-modules/
  routes/      Express Router로 분리한 API 라우트
  services/    메시지 조회 비즈니스 로직
  utils/       JSON 파일 읽기 공통 함수
  public/      fetch()로 API를 호출하는 정적 프론트 파일
  server.js    import/export로 조립한 Express 서버
07-modules-only/
  esmodule-default-import/ Node ES Module default import 예제
  esmodule-import/   Node ES Module import/export 예제
08-express-post-json/
  public/      GET과 POST fetch를 실행하는 정적 프론트 파일
  server.js    express.json()과 POST 요청 처리 예제
09-express-routing-only/
  server.js    Express 라우팅만 다루는 단순 예제
10-express-router/
  routes/      Express Router로 분리한 라우트 묶음
  server.js    라우터를 연결하는 Express 서버
```

## 1단계 목표

작은 HTTP 서버를 만들고 아래 주소들이 어떻게 처리되는지 비교합니다.

- `/` : 첫 화면
- `/hello?name=Jin` : 쿼리스트링에서 이름 읽기
- `/time` : JSON 응답 보내기
- 없는 주소 : 404 응답 보내기

## 실행 순서

먼저 Pure Node 예제를 실행합니다.

```powershell
cd C:\dev\node2026\01-basics\pure-node
node server.js
```

브라우저에서 `http://localhost:3000`을 엽니다.

그 다음 Express 예제를 실행합니다.

```powershell
cd C:\dev\node2026\01-basics\express
npm install
node server.js
```

브라우저에서 `http://localhost:4000`을 엽니다.

## 비교하면서 볼 것

- 요청 주소를 직접 분석하는 코드가 어디에 있는지
- JSON 응답을 보내는 코드가 얼마나 다른지
- 404 처리가 어떤 식으로 표현되는지
- 같은 기능인데 Express 코드가 왜 읽기 쉬운지

## 2단계 목표

JSON 파일을 읽어서 API 응답으로 보내고, 파일 읽기 중 생길 수 있는 에러를 처리합니다.

- `/users` : `data/users.json` 전체 읽기
- `/users/1` : 특정 사용자 한 명 찾기
- `/missing-file` : 없는 파일을 읽을 때의 에러 처리 확인

Pure Node 예제를 실행합니다.

```powershell
cd C:\dev\node2026\02-file-read\pure-node
node server.js
```

브라우저에서 `http://localhost:3100/users`를 엽니다.

Express 예제를 실행합니다.

```powershell
cd C:\dev\node2026\02-file-read\express
npm install
node server.js
```

브라우저에서 `http://localhost:4100/users`를 엽니다.

## 3단계 목표

`public/index.html` 파일을 서버에서 읽어서 브라우저에 보여주고, 없는 주소의 404 화면도 처리합니다.

- `/` : `public/index.html` 읽기
- 없는 주소 : 404 상태 코드와 안내 화면 보내기

Pure Node 예제를 실행합니다.

```powershell
cd C:\dev\node2026\03-html-file\pure-node
node server.js
```

브라우저에서 `http://localhost:3200`을 엽니다.

Express 예제를 실행합니다.

```powershell
cd C:\dev\node2026\03-html-file\express
npm install
node server.js
```

브라우저에서 `http://localhost:4200`을 엽니다.

## 4단계 목표

이제부터는 Express만 사용합니다. `express.static()`으로 `public` 폴더 안의 정적 파일을 자동 제공하는 방법을 배웁니다.

- `/` : `public/index.html` 자동 응답
- `/about.html` : `public/about.html` 자동 응답
- `/style.css` : CSS 파일 자동 응답
- `/app.js` : 브라우저 JavaScript 파일 자동 응답
- `/assets/static-flow.svg` : 이미지 파일 자동 응답
- 없는 주소 : 직접 만든 404 페이지 응답

Express 정적 파일 예제를 실행합니다.

```powershell
cd C:\dev\node2026\04-express-static
npm install
node server.js
```

브라우저에서 `http://localhost:4300`을 엽니다.

## 5단계 목표

정적 파일로 제공된 브라우저 JavaScript에서 Express API를 호출합니다.

- `/` : `public/index.html` 자동 응답
- `/api/messages` : `data/messages.json`을 읽어서 JSON 응답
- `/api/messages/1` : 특정 메시지 하나 응답
- `/health` : 서버 상태 JSON 응답
- 브라우저 `fetch()` : API 응답을 받아 화면에 메시지 목록 표시

Express fetch API 예제를 실행합니다.

```powershell
cd C:\dev\node2026\05-express-fetch-api
npm install
node server.js
```

브라우저에서 `http://localhost:4400`을 엽니다.

## 6단계 목표

기존 Express API 예제를 ES Module 방식의 `import`와 `export`로 나눕니다.

- `server.js` : Express 앱 생성과 전체 조립
- `routes/messages.js` : 메시지 API 라우트
- `services/messageService.js` : 메시지 데이터 조회 로직
- `utils/file.js` : JSON 파일 읽기 공통 함수
- `public/app.js` : 브라우저에서 `fetch()`로 API 호출

Express 모듈 분리 예제를 실행합니다.

```powershell
cd C:\dev\node2026\06-express-modules
npm install
node server.js
```

브라우저에서 `http://localhost:4500`을 엽니다.

## 7단계 목표

다른 기능을 섞지 않고 모듈 처리만 봅니다.

- `esmodule-default-import` : Node.js의 `export default`와 default import
- `esmodule-import` : Node.js의 named `import`와 named `export`
- 함수 하나, 여러 함수 묶음, 객체 하나를 각각 모듈로 분리

ES Module default import 예제를 실행합니다.

```powershell
cd C:\dev\node2026\07-modules-only\esmodule-default-import
node app.js
```

ES Module import 예제를 실행합니다.

```powershell
cd C:\dev\node2026\07-modules-only\esmodule-import
node app.js
```

## 8단계 목표

브라우저에서 JSON 데이터를 서버로 보내고, Express에서 `req.body`로 읽습니다.

- `express.json()` : JSON 요청 본문을 `req.body`로 바꿔줌
- `GET /api/messages` : 메모리 배열의 메시지 목록 조회
- `POST /api/messages` : 브라우저가 보낸 JSON으로 새 메시지 추가
- 간단한 유효성 검사 : 제목과 내용이 없으면 400 응답
- 서버 메모리 저장 : 서버를 재시작하면 추가한 메시지는 사라짐

Express POST JSON 예제를 실행합니다.

```powershell
cd C:\dev\node2026\08-express-post-json
npm install
node server.js
```

브라우저에서 `http://localhost:4700`을 엽니다.

## 9단계 목표

다른 구조를 섞지 않고 Express 라우팅만 봅니다.

- `app.get("/")` : 기본 경로
- `app.get("/hello")` : 고정 경로
- `app.get("/hello/:name")` : 경로 파라미터
- `app.get("/users")` : 목록 라우트
- `app.get("/users/:id")` : ID 파라미터 라우트
- `app.get("/search?keyword=node")` : 쿼리스트링
- `app.use(...)` : 마지막 404 처리

Express 라우팅 전용 예제를 실행합니다.

```powershell
cd C:\dev\node2026\09-express-routing-only
npm install
node server.js
```

브라우저에서 `http://localhost:4800`을 엽니다.

## 10단계 목표

`express.Router()`로 관련 라우트를 파일 단위로 묶습니다.

- `server.js` : `/users`, `/products` 라우터 연결
- `routes/users.js` : 사용자 관련 라우트 묶음
- `routes/products.js` : 상품 관련 라우트 묶음
- `router.get("/")` : 라우터의 기준 경로
- `router.get("/:id")` : 라우터 안의 경로 파라미터

Express Router 예제를 실행합니다.

```powershell
cd C:\dev\node2026\10-express-router
npm install
node server.js
```

브라우저에서 `http://localhost:4900`을 엽니다.
