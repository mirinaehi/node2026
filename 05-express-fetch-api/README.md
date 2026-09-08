# 05. Express API를 fetch로 호출하기

이 예제는 Express 서버가 정적 파일과 API를 함께 제공하는 구조를 보여줍니다.

브라우저는 `public/index.html`, `public/style.css`, `public/app.js`를 정적 파일로 받고, `app.js`가 `fetch()`로 `/api/messages` API를 호출합니다.

## 처음 한 번만 설치

```powershell
npm install
```

## 실행

```powershell
node server.js
```

열어볼 주소:

- `http://localhost:4400`
- `http://localhost:4400/api/messages`
- `http://localhost:4400/api/messages/1`
- `http://localhost:4400/api/messages/999`
- `http://localhost:4400/health`

## 관찰 포인트

- `express.static()`은 HTML, CSS, JS 파일을 제공합니다.
- `app.get("/api/messages")`는 JSON API를 제공합니다.
- 브라우저의 `fetch("/api/messages")`는 같은 서버의 API를 호출합니다.
- 서버는 `res.json()`으로 응답하고, 브라우저는 받은 JSON을 화면에 그립니다.
- 없는 메시지 ID는 404 JSON 응답으로 처리합니다.

