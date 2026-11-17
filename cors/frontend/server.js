import express from "express";

const app = express();

// 브라우저에서 사용할 HTML, CSS, JavaScript 파일을 제공합니다.
app.use(express.static("./frontend/public"));

app.listen(3000, () => {
  console.log("Frontend: http://localhost:3000");
});
