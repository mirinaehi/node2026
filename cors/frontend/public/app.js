const loadButton = document.querySelector("#loadButton");
const result = document.querySelector("#result");

loadButton.addEventListener("click", async () => {
  // 현재 페이지는 3000번 포트지만, 데이터는 4000번 포트의 서버에 요청합니다.
  const response = await fetch("http://localhost:4000/api/message");
  const data = await response.json();

  result.textContent = data.message;
});
