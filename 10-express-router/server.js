import express from "express";
import productRoutes from "./routes/products.js";
import userRoutes from "./routes/users.js";

const app = express();
const PORT = 4900;

app.get("/", (req, res) => {
  res.json({
    message: "Express Router 예제입니다.",
    routes: [
      "/users",
      "/users/1",
      "/products",
      "/products/p1",
    ],
  });
});

app.use("/users", userRoutes);
app.use("/products", productRoutes);

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    example: "express-router",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "등록된 라우터나 라우트를 찾을 수 없습니다.",
    path: req.path,
  });
});

app.listen(PORT, () => {
  console.log(`Express Router server: http://localhost:${PORT}`);
});

