const signupForm = document.querySelector("#signup-form");
const loginForm = document.querySelector("#login-form");
const signupButton = signupForm.querySelector("button");
const loginButton = loginForm.querySelector("button");
const logoutButton = document.querySelector("#logout-button");
const message = document.querySelector("#message");

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

// fetch로 JSON을 주고받습니다. 같은 출처(프로토콜·호스트·포트)로 보내는 요청에는 쿠키도 함께 갑니다.
async function request(url, data) {
  const response = await fetch(url, data === undefined ? {} : {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return response.json();
}

function showUser(user) {
  document.querySelector("#auth-section").hidden = !!user;
  document.querySelector("#user-section").hidden = !user;
  document.querySelector("#user-name").textContent = user?.name || "";
  document.querySelector("#user-email").textContent = user?.email || "";
}

// 기본 페이지 이동을 막고 '입력 → API 요청 → 결과 표시'를 수행합니다.
// FormData는 각 입력란의 name과 값을 모읍니다. Object.fromEntries는 이를 객체로 바꿉니다.
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (signupButton.disabled) return;
  signupButton.disabled = true;
  const data = Object.fromEntries(new FormData(signupForm));

  const result = await request("/api/signup", data);
  signupButton.disabled = false;
  showMessage(result.message, !result.user);
  if (result.user) {
    signupForm.reset();
    loginForm.elements.email.value = result.user.email;
    loginForm.elements.password.focus();
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (loginButton.disabled) return;
  loginButton.disabled = true;
  const data = Object.fromEntries(new FormData(loginForm));

  const result = await request("/api/login", data);
  loginButton.disabled = false;
  showMessage(result.message, !result.user);
  if (result.user) {
    loginForm.reset();
    showUser(result.user);
  }
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  const result = await request("/api/logout", {});
  logoutButton.disabled = false;
  showUser(null);
  showMessage(result.message);
});

// 새로고침해도 남아 있는 쿠키로 서버에 로그인 상태를 확인합니다. 401은 미로그인 상태입니다.
async function restoreSession() {
  const result = await request("/api/me");
  showUser(result.user);
  signupButton.disabled = false;
  loginButton.disabled = false;
}

restoreSession();
