# 03. Express HTML 파일 읽기

이 예제는 Pure Node HTML 파일 읽기 예제와 같은 기능을 Express로 구현합니다.

## 처음 한 번만 설치

```powershell
npm install
```

## 실행

```powershell
node server.js
```

열어볼 주소:

- `http://localhost:4200`
- `http://localhost:4200/not-found`

## 관찰 포인트

Express에서는 아래 부분이 더 짧아집니다.

- `res.sendFile()`로 HTML 파일 보내기
- `app.use()`로 404 처리 모으기
- 에러 처리 미들웨어로 파일 전송 실패 처리하기

다음에는 여러 정적 파일을 더 쉽게 제공하는 `express.static()`도 사용할 수 있습니다.

