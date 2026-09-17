# 11. Express Middleware

이번 예제는 Express 미들웨어만 집중해서 봅니다.

미들웨어는 요청이 라우트에 도착하기 전이나 응답이 끝나기 전에 중간에서 실행되는 함수입니다.

## 처음 한 번만 설치

```powershell
npm install
```

## 실행

```powershell
node server.js
```

열어볼 주소:

- `http://localhost:5000`
- `http://localhost:5000/public`
- `http://localhost:5000/admin`
- `http://localhost:5000/admin?apiKey=secret`
- `http://localhost:5000/health`
- `http://localhost:5000/not-found`

## 관찰 포인트

- `app.use(requestLogger)`는 모든 요청에서 먼저 실행됩니다.
- `app.use(addRequestTime)`은 모든 요청에 `req.requestTime`을 추가합니다.
- `next()`를 호출해야 다음 미들웨어나 라우트로 넘어갑니다.
- `/public`은 추가 검사 없이 응답합니다.
- `/admin`은 `requireApiKey` 미들웨어를 통과해야 응답합니다.
- `/admin`에 `apiKey`가 없으면 401 응답을 보냅니다.
- `/admin?apiKey=secret`은 검사를 통과하고 정상 응답합니다.

## 미들웨어 흐름

```text
요청
  -> requestLogger
  -> addRequestTime
  -> 라우트 처리
  -> 응답
```

`/admin` 요청만 중간에 `requireApiKey`가 하나 더 들어갑니다.

```text
/admin 요청
  -> requestLogger
  -> addRequestTime
  -> requireApiKey
  -> /admin 라우트 처리
  -> 응답
```
