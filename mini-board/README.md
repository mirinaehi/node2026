# Mini Board

하나의 Node.js 프로젝트에 기능을 조금씩 더해 가며 미니 게시판을 완성하는 누적 예제입니다.

## 1단계 목표

Node 기본 `http` 모듈로 서버를 만들고, 브라우저 요청에 따라 다른 응답을 보내는 흐름을 확인합니다.

- `/` : 미니 게시판 첫 응답
- `/health` : 서버 상태를 JSON으로 응답
- 그 외 주소 : 404 응답

## 2단계 목표

Node의 파일 읽기 기능으로 JSON 파일을 읽고, 게시글 목록과 상세 데이터를 응답합니다.

- `data/posts.json` : 게시글 데이터 파일
- `/posts` : JSON 파일에 있는 게시글 목록 응답
- `/posts/1` : JSON 파일에서 특정 게시글 하나를 찾아 응답

## 3단계 목표

HTML 파일을 서버에서 읽어서 브라우저에 보여줍니다.

- `public/index.html` : `/` 요청에 응답할 첫 화면 HTML 파일
- `public/404.html` : 없는 주소에 응답할 404 HTML 파일
- `/` : 문자열 대신 HTML 파일 응답
- 없는 주소 : 404 상태 코드와 HTML 파일 응답

## 4단계 목표

HTML에서 연결한 CSS와 브라우저 JavaScript 파일을 정적 파일로 제공합니다.

- `public/style.css` : 첫 화면에 적용할 스타일 파일
- `public/app.js` : 브라우저에서 실행할 JavaScript 파일
- `/static/style.css` : CSS 정적 파일 응답
- `/static/app.js` : JavaScript 정적 파일 응답

## 5단계 목표

Node 기본 `http` 모듈로 직접 처리하던 서버를 Express로 리팩터링합니다.

- `express()` : Express 앱 생성
- `app.get()` : 경로별 요청 처리
- `res.json()` : JSON 응답 처리
- `res.sendFile()` : HTML 파일 응답 처리
- `express.static()` : 정적 파일 응답 처리
- `app.use()` : 마지막 404 처리

## 6단계 목표

브라우저 JavaScript에서 서버 API를 호출하고, 받은 JSON 데이터를 화면에 표시합니다.

- `fetch("/posts")` : 브라우저에서 게시글 목록 API 호출
- `response.json()` : API 응답 본문을 JavaScript 데이터로 변환
- DOM 조작 : 받은 게시글 목록을 HTML 요소로 렌더링
- 실패 처리 : API 호출 실패 시 화면에 안내 문구 표시

## 7단계 목표

Express 코드를 역할별 파일로 나누고 `import`/`export`로 연결합니다.

- `server.js` : 서버 실행 시작
- `src/app.js` : Express 앱 생성과 라우트 조립
- `src/config/paths.js` : 프로젝트에서 사용하는 파일 경로 관리
- `src/data/postsFile.js` : 게시글 JSON 파일 읽기와 게시글 찾기
- `export` : 다른 파일에서 사용할 값과 함수 공개
- `import` : 공개된 값과 함수를 필요한 파일에서 가져오기

## 실행

```powershell
cd C:\dev\node2026\mini-board
npm install
npm start
```

브라우저에서 아래 주소를 열어 봅니다.

```text
http://localhost:3000
http://localhost:3000/health
http://localhost:3000/static/style.css
http://localhost:3000/static/app.js
http://localhost:3000/posts
http://localhost:3000/posts/1
http://localhost:3000/not-found
```
