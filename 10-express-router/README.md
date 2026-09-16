# 10. Express Router

이번 예제는 `express.Router()`만 집중해서 봅니다.

`09-express-routing-only`에서는 모든 라우트를 `server.js` 하나에 적었습니다. 이번에는 관련 라우트를 파일별로 묶습니다.

## 처음 한 번만 설치

```powershell
npm install
```

## 실행

```powershell
node server.js
```

열어볼 주소:

- `http://localhost:4900`
- `http://localhost:4900/users`
- `http://localhost:4900/users/1`
- `http://localhost:4900/users/999`
- `http://localhost:4900/products`
- `http://localhost:4900/products/p1`
- `http://localhost:4900/products/missing`
- `http://localhost:4900/not-found`

## 관찰 포인트

- `server.js`는 라우터를 연결만 합니다.
- `routes/users.js`는 사용자 관련 요청만 담당합니다.
- `routes/products.js`는 상품 관련 요청만 담당합니다.
- `app.use("/users", userRoutes)`로 연결하면 `users.js` 안의 `router.get("/")`는 실제로 `/users`가 됩니다.
- `router.get("/:id")`는 `/users/:id` 또는 `/products/:id`처럼 기준 경로 뒤에 붙습니다.

