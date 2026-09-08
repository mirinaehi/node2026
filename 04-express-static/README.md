# 04. Express 정적 파일 제공

이 예제부터는 Express만 사용합니다.

`express.static()`을 사용하면 `public` 폴더 안의 HTML, CSS, JavaScript, 이미지 파일을 Express가 자동으로 찾아서 응답합니다.

## 처음 한 번만 설치

```powershell
npm install
```

## 실행

```powershell
node server.js
```

열어볼 주소:

- `http://localhost:4300`
- `http://localhost:4300/about.html`
- `http://localhost:4300/style.css`
- `http://localhost:4300/app.js`
- `http://localhost:4300/assets/static-flow.svg`
- `http://localhost:4300/not-found`

## 관찰 포인트

- `server.js`에는 개별 HTML/CSS/JS 파일을 읽는 코드가 없습니다.
- `app.use(express.static(PUBLIC_DIR))` 한 줄이 `public` 폴더를 웹에서 접근 가능하게 만듭니다.
- `index.html` 안에서 `style.css`, `app.js`, 이미지 파일을 평범한 브라우저 방식으로 불러옵니다.
- 없는 주소는 마지막 404 미들웨어에서 처리합니다.

