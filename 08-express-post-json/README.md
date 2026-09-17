# 08. Express POST JSON

이번 예제는 브라우저가 서버로 JSON 데이터를 보내고, Express가 그 데이터를 `req.body`로 읽은 뒤 JSON 파일에 저장하는 흐름을 배웁니다.

## 처음 한 번만 설치

```powershell
npm install
```

## 실행

```powershell
node server.js
```

열어볼 주소:

- `http://localhost:4700`
- `http://localhost:4700/api/messages`
- `http://localhost:4700/health`
- `data/messages.json`

## 핵심 코드

```js
app.use(express.json());
```

이 코드가 있어야 JSON 요청 본문을 `req.body`에서 읽을 수 있습니다.

브라우저에서는 아래처럼 보냅니다.

```js
await fetch("/api/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "새 메시지",
    body: "브라우저에서 서버로 보낸 내용입니다.",
  }),
});
```

## 관찰 포인트

- `GET`은 서버에서 데이터를 가져옵니다.
- `POST`는 서버로 새 데이터를 보냅니다.
- `Content-Type: application/json`은 요청 본문이 JSON이라는 표시입니다.
- `JSON.stringify()`는 JavaScript 객체를 JSON 문자열로 바꿉니다.
- `req.body`에는 브라우저가 보낸 데이터가 들어옵니다.
- `readMessages()`는 `data/messages.json` 파일을 읽습니다.
- `writeMessages()`는 새 메시지가 추가된 배열을 다시 `data/messages.json` 파일에 저장합니다.
- 서버를 재시작해도 추가한 메시지는 JSON 파일에 남아 있습니다.
