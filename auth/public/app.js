const loginForm = document.querySelector("#loginForm");
const idInput = document.querySelector("#id");
const passwordInput = document.querySelector("#password");
const loginState = document.querySelector("#loginState");
const profileButton = document.querySelector("#profileButton");
const adminButton = document.querySelector("#adminButton");
const logoutButton = document.querySelector("#logoutButton");
const status = document.querySelector("#status");
const responseBody = document.querySelector("#responseBody");

let token = "";

function showResponse(response, data) {
  status.textContent = `${response.status} ${response.statusText}`;
  status.className = response.ok ? "success" : "failure";
  responseBody.textContent = JSON.stringify(data, null, 2);
}

function authorizationHeader() {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 예제 계정을 누르면 로그인 폼에 아이디와 비밀번호를 채웁니다.
document.querySelectorAll("[data-id]").forEach((button) => {
  button.addEventListener("click", () => {
    idInput.value = button.dataset.id;
    passwordInput.value = button.dataset.password;
  });
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: idInput.value, password: passwordInput.value })
  });
  const data = await response.json();

  if (response.ok) {
    token = data.token;
    loginState.textContent = `${data.user.name} 로그인 중 · 권한: ${data.user.role}`;
  }

  showResponse(response, data);
});

profileButton.addEventListener("click", async () => {
  const response = await fetch("/api/profile", {
    headers: authorizationHeader()
  });
  showResponse(response, await response.json());
});

adminButton.addEventListener("click", async () => {
  const response = await fetch("/api/admin/report", {
    headers: authorizationHeader()
  });
  showResponse(response, await response.json());
});

logoutButton.addEventListener("click", async () => {
  const response = await fetch("/api/logout", {
    method: "POST",
    headers: authorizationHeader()
  });
  const data = await response.json();

  if (response.ok) {
    token = "";
    loginState.textContent = "현재 로그인하지 않았습니다.";
  }

  showResponse(response, data);
});
