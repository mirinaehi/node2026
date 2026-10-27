import { createApp } from "./src/app.js";

const PORT = process.env.PORT || 5100;
const app = createApp();

// 앱 설정은 createApp에서, 실제 요청을 받는 작업은 listen에서 시작합니다.
app.listen(PORT, () => {
  console.log(`Login server is running at http://localhost:${PORT}`);
});
