# 03. Pure Node HTML 파일 읽기

이 예제는 `public/index.html` 파일을 읽어서 브라우저에 보여줍니다.

## 실행

```powershell
node server.js
```

열어볼 주소:

- `http://localhost:3200`
- `http://localhost:3200/not-found`

## 관찰 포인트

Pure Node에서는 아래 일을 직접 처리합니다.

- 요청 경로 확인
- HTML 파일 읽기
- `Content-Type: text/html` 헤더 지정
- 없는 주소에 404 상태 코드 보내기
- 서버 내부 에러가 났을 때 500 응답 보내기

