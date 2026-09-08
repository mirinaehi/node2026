# 06. Express import와 모듈 분리

이번 예제는 기능을 크게 늘리지 않고, `05-express-fetch-api` 예제를 여러 파일로 나누는 데 집중합니다.

`package.json`에 `"type": "module"`을 넣으면 Node.js에서 ES Module 문법을 사용할 수 있습니다.

```js
import express from "express";
export default router;
```

## 처음 한 번만 설치

```powershell
npm install
```

## 실행

```powershell
node server.js
```

열어볼 주소:

- `http://localhost:4500`
- `http://localhost:4500/api/messages`
- `http://localhost:4500/api/messages/1`
- `http://localhost:4500/api/messages/999`
- `http://localhost:4500/health`

## 파일 역할

- `server.js` : Express 앱을 만들고 정적 파일, API 라우터, 404, 에러 처리를 연결합니다.
- `routes/messages.js` : `/api/messages` 관련 라우트만 담당합니다.
- `services/messageService.js` : 메시지 전체 조회와 단건 조회 로직을 담당합니다.
- `utils/file.js` : JSON 파일을 읽는 공통 함수를 제공합니다.
- `public/app.js` : 브라우저에서 `fetch()`로 API를 호출하고 화면을 갱신합니다.

## 관찰 포인트

- `import`는 다른 파일이나 패키지에서 코드를 가져옵니다.
- `export`는 다른 파일에서 사용할 수 있도록 코드를 내보냅니다.
- `default export`는 파일의 대표 값을 하나 내보낼 때 씁니다.
- `named export`는 이름 붙은 값을 여러 개 내보낼 때 씁니다.
- 코드가 길어질수록 라우트, 서비스, 유틸을 나누면 읽기 쉬워집니다.

