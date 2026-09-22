# Mini Board

하나의 Node.js 프로젝트에 기능을 조금씩 더해 가며 미니 게시판을 완성하는 누적 예제입니다.

## 1단계 목표

Node 기본 `http` 모듈로 서버를 만들고, 브라우저 요청에 따라 다른 응답을 보내는 흐름을 확인합니다.

- `/` : 미니 게시판 첫 응답
- `/health` : 서버 상태를 JSON으로 응답
- 그 외 주소 : 404 응답

## 실행

```powershell
cd C:\dev\node2026\mini-board
npm start
```

브라우저에서 아래 주소를 열어 봅니다.

```text
http://localhost:3000
http://localhost:3000/health
http://localhost:3000/not-found
```
