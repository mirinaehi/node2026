const statusText = document.querySelector("#statusText");
const countButton = document.querySelector("#countButton");
const themeButton = document.querySelector("#themeButton");

let count = 0;

if (countButton && statusText) {
  countButton.addEventListener("click", () => {
    count += 1;
    statusText.textContent = `버튼을 ${count}번 눌렀습니다. 이 동작은 public/app.js에서 실행됩니다.`;
  });
}

if (themeButton) {
  themeButton.addEventListener("click", () => {
    const isMint = document.body.dataset.theme === "mint";

    document.body.dataset.theme = isMint ? "" : "mint";
  });
}
