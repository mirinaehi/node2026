// 서버를 실행하는 시작 파일입니다. 터미널에서 npm start를 실행하면 이 파일이 실행됩니다.
// import는 다른 파일에서 공개한 함수나 값을 가져오는 문법입니다.
import { createApp } from "./src/app.js";

// 포트는 한 컴퓨터에서 여러 서버를 구분하는 번호입니다.
// process.env는 실행 환경의 설정입니다. PORT 설정이 없으면 5100을 사용합니다.
const PORT = process.env.PORT || 5100;
// 앱의 설정과 실제 실행을 나누면 테스트에서도 같은 앱을 만들어 사용할 수 있습니다.
const app = createApp();

// listen으로 지정한 포트에서 요청을 받기 시작합니다.
// () => { ... }는 함수이며, 여기서는 서버가 준비되었을 때 실행됩니다.
app.listen(PORT, () => {
  console.log(`Login server is running at http://localhost:${PORT}`);
});
