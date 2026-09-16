# 09. Express 라우팅만 보기

이번 예제는 Express 라우팅만 집중해서 봅니다.

정적 파일, fetch, 모듈 분리, 파일 읽기, POST 요청은 일부러 넣지 않았습니다.

## 처음 한 번만 설치

```powershell
npm install
```

## 실행

```powershell
node server.js
```

열어볼 주소:

- `http://localhost:4800`
- `http://localhost:4800/hello`
- `http://localhost:4800/hello/Jin`
- `http://localhost:4800/users`
- `http://localhost:4800/users/1`
- `http://localhost:4800/users/999`
- `http://localhost:4800/search?keyword=node`
- `http://localhost:4800/not-found`

## 관찰 포인트

- `app.get("/", ...)`은 정확히 `/` 요청을 처리합니다.
- `app.get("/hello/:name", ...)`의 `:name`은 `req.params.name`으로 읽습니다.
- `app.get("/search", ...)`의 `?keyword=node`는 `req.query.keyword`로 읽습니다.
- 더 구체적인 라우트를 먼저 보고, 마지막에 `app.use()`로 404를 처리합니다.

