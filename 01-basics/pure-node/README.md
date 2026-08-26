# 01. Pure Node HTTP 서버

이 예제는 외부 라이브러리 없이 Node.js의 기본 `http` 모듈만 사용합니다.

## 실행

```powershell
node server.js
```

열어볼 주소:

- `http://localhost:3000`
- `http://localhost:3000/hello?name=Jin`
- `http://localhost:3000/time`
- `http://localhost:3000/not-found`

## 관찰 포인트

Pure Node에서는 요청 URL을 직접 해석하고, 응답 헤더도 직접 정합니다. 그래서 동작 원리를 보기에는 좋지만 코드가 금방 길어집니다.

