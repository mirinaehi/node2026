# 02. Pure Node 파일 읽기

이 예제는 Node.js 기본 `fs/promises` 모듈로 JSON 파일을 읽고 HTTP 응답으로 보냅니다.

## 실행

```powershell
node server.js
```

열어볼 주소:

- `http://localhost:3100`
- `http://localhost:3100/users`
- `http://localhost:3100/users/1`
- `http://localhost:3100/users/999`
- `http://localhost:3100/missing-file`

## 관찰 포인트

Pure Node에서는 아래 일을 직접 해줘야 합니다.

- URL 경로 분석
- 파일 경로 만들기
- 파일 읽기
- JSON 문자열 파싱
- 응답 상태 코드와 Content-Type 지정
- 파일 없음, JSON 파싱 실패 같은 에러 처리

