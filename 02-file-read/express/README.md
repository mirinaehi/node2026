# 02. Express 파일 읽기

이 예제는 Pure Node 파일 읽기 예제와 같은 기능을 Express로 구현합니다.

## 처음 한 번만 설치

```powershell
npm install
```

## 실행

```powershell
node server.js
```

열어볼 주소:

- `http://localhost:4100`
- `http://localhost:4100/users`
- `http://localhost:4100/users/1`
- `http://localhost:4100/users/999`
- `http://localhost:4100/missing-file`

## 관찰 포인트

Express에서는 아래 부분이 더 짧아집니다.

- `app.get()`으로 경로별 코드 분리
- `req.params.id`로 URL 값 읽기
- `res.status().json()`으로 상태 코드와 JSON 응답 보내기
- 에러 처리 미들웨어로 공통 에러 응답 모으기

