# Node.js 기초 쌓기

이 저장소는 같은 기능을 두 방식으로 나란히 만들어 보면서 Node.js의 기본기와 Express의 편리함을 천천히 익히기 위한 연습 공간입니다.

## 폴더 구성

```text
01-basics/
  pure-node/   Node.js 기본 모듈만 사용하는 예제
  express/     Express를 사용하는 같은 기능의 예제
```

## 1단계 목표

작은 HTTP 서버를 만들고 아래 주소들이 어떻게 처리되는지 비교합니다.

- `/` : 첫 화면
- `/hello?name=Jin` : 쿼리스트링에서 이름 읽기
- `/time` : JSON 응답 보내기
- 없는 주소 : 404 응답 보내기

## 실행 순서

먼저 Pure Node 예제를 실행합니다.

```powershell
cd 01-basics/pure-node
node server.js
```

브라우저에서 `http://localhost:3000`을 엽니다.

그 다음 Express 예제를 실행합니다.

```powershell
cd ../express
npm install
node server.js
```

브라우저에서 `http://localhost:4000`을 엽니다.

## 비교하면서 볼 것

- 요청 주소를 직접 분석하는 코드가 어디에 있는지
- JSON 응답을 보내는 코드가 얼마나 다른지
- 404 처리가 어떤 식으로 표현되는지
- 같은 기능인데 Express 코드가 왜 읽기 쉬운지

