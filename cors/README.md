# CORS 예제

프런트엔드와 API 서버를 서로 다른 포트로 실행하는 예제입니다.

- 프런트엔드: `http://localhost:3000`
- API 서버: `http://localhost:4000`

프로토콜과 주소가 같아도 포트가 다르면 서로 다른 출처(origin)입니다. 따라서 브라우저가 API 응답을 사용할 수 있도록 API 서버에 CORS 설정이 필요합니다.

## 실행

먼저 패키지를 설치합니다.

```bash
npm install
```

첫 번째 터미널에서 API 서버를 실행합니다.

```bash
npm run backend
```

두 번째 터미널에서 프런트엔드 서버를 실행합니다.

```bash
npm run frontend
```

브라우저에서 `http://localhost:3000`에 접속한 뒤 버튼을 누르면 프로젝트 대시보드 데이터를 불러옵니다.

API 데이터는 `http://localhost:4000/api/dashboard`에서도 직접 확인할 수 있습니다.

## 핵심 코드

```js
app.use(cors({
  origin: "http://localhost:3000"
}));
```

API 서버가 응답에 다음과 같은 헤더를 추가하도록 만드는 설정입니다.

```text
Access-Control-Allow-Origin: http://localhost:3000
```

`backend/server.js`에서 `app.use(cors(...))`를 잠시 주석 처리하면 API 서버는 응답하지만, 브라우저는 CORS 정책 때문에 프런트엔드 JavaScript가 응답을 읽지 못하게 합니다.
