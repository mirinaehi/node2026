// 이 파일은 서버가 아니라 사용자의 브라우저에서 실행됩니다.
// 브라우저는 입력과 화면 표시를 담당하고, 가입·로그인 판단과 저장은 서버가 담당합니다.
// document는 현재 HTML 문서입니다. querySelector('#이름')으로 해당 id의 요소를 찾습니다.
const form = document.querySelector("#auth-form");
const message = document.querySelector("#message");
const submitButton = document.querySelector("#submit-button");
const password = document.querySelector("#password");
const confirmPassword = document.querySelector("#password-confirm");
const email = document.querySelector("#email");
// mode는 현재 화면 종류, busy는 서버 응답을 기다리는 중인지를 기억하는 변수입니다.
let mode = "login";
let busy = false;

// 성공·실패 안내를 같은 위치에 표시합니다. isError를 생략하면 false로 처리합니다.
function showMessage(text, isError = false) {
  // textContent는 내용을 HTML 코드로 실행하지 않고 글자로 표시합니다.
  message.textContent = text;
  // toggle('error', true)는 CSS 클래스를 추가하고, false는 제거합니다.
  message.classList.toggle("error", isError);
}

// 페이지를 새로 불러오는 대신 한 폼의 제목, 입력란, 버튼을 바꿔 두 화면으로 사용합니다.
function setMode(nextMode) {
  // 가입 요청 중에 로그인 화면으로 전환하는 등 서로 충돌하는 조작을 막습니다.
  if (busy) return;
  mode = nextMode;
  const signingUp = mode === "signup";
  document.querySelector("#heading").textContent = signingUp ? "나만의 계정 만들기" : "다시 만나 반가워요";
  document.querySelector("#description").textContent = signingUp ? "간단한 정보만 입력하면 준비 끝이에요." : "이메일로 로그인하고 시작하세요.";
  // 로그인에는 필요 없는 이름과 비밀번호 확인 입력란을 회원가입 때만 사용합니다.
  for (const id of ["name-field", "confirm-field"]) {
    const field = document.getElementById(id);
    // hidden은 화면에서 숨기기, disabled는 입력·폼 검사를 제외하기,
    // required는 반드시 입력하도록 설정하기입니다. 각각 역할이 다릅니다.
    field.hidden = !signingUp;
    field.querySelector("input").disabled = !signingUp;
    field.querySelector("input").required = signingUp;
  }
  for (const tabMode of ["login", "signup"]) {
    const tab = document.getElementById(`${tabMode}-tab`);
    // active는 눈에 보이는 선택 표시, aria-pressed는 화면 읽기 도구에 전달할 선택 상태입니다.
    tab.classList.toggle("active", mode === tabMode);
    tab.setAttribute("aria-pressed", String(mode === tabMode));
  }
  // autocomplete는 브라우저에 기존 비밀번호인지 새 비밀번호인지 알려주는 힌트입니다.
  password.autocomplete = signingUp ? "new-password" : "current-password";
  // 화면을 전환할 때 이전 비밀번호와 검사 오류를 지웁니다.
  password.value = "";
  confirmPassword.value = "";
  confirmPassword.setCustomValidity("");
  submitButton.textContent = signingUp ? "회원가입" : "로그인";
  document.querySelector("#switch-hint").textContent = signingUp ? "이미 계정이 있으신가요?" : "아직 계정이 없으신가요?";
  document.querySelector("#switch-button").textContent = signingUp ? "로그인" : "회원가입";
  showMessage("");
}

// 비동기 요청 중에는 버튼을 잠가 여러 번 클릭해도 같은 요청이 중복 전송되지 않게 합니다.
function setBusy(value) {
  busy = value;
  for (const button of document.querySelectorAll("button")) button.disabled = value;
  // aria-busy는 보조 기기에 현재 처리 중인 상태임을 알려줍니다.
  form.setAttribute("aria-busy", String(value));
  submitButton.textContent = value ? "처리 중…" : mode === "signup" ? "회원가입" : "로그인";
}

// 서버와 통신하는 공통 함수입니다. data가 없으면 조회(GET), 있으면 전송(POST)합니다.
// async/await로 응답을 기다리는 동안에도 브라우저는 다른 작업을 처리할 수 있습니다.
async function request(url, data) {
  // fetch는 HTTP 요청을 보냅니다. '/api/login'처럼 같은 출처(프로토콜·호스트·포트)로
  // 요청하면, 저장된 쿠키도 기본적으로 함께 보냅니다. 여기서 직접 토큰을 읽을 필요는 없습니다.
  const response = await fetch(url, data === undefined ? {} : {
    method: "POST",
    // 서버에 JSON을 보낸다고 알리고 객체를 JSON 문자열로 바꿔 전송합니다.
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  // response는 상태 코드·헤더·본문을 가진 응답입니다. json()으로 본문을 객체로 읽습니다.
  const result = await response.json();
  // fetch는 400·401 같은 HTTP 오류만으로는 실패하지 않으므로 response.ok도 검사합니다.
  // throw로 에러를 던지면 호출한 곳의 catch가 처리합니다.
  // Object.assign은 Error 객체에 status를 추가해 서버 오류와 네트워크 오류를 구별하게 합니다.
  if (!response.ok) throw Object.assign(new Error(result.message), { status: response.status });
  return result;
}

// 회원 객체가 있으면 환영 화면을, null이면 로그인 폼을 보여 줍니다.
// 이 화면 전환 자체가 인증은 아닙니다. 실제 인증은 서버의 세션 검사에서 이루어집니다.
function showUser(user) {
  // !!는 값을 true/false로 바꿉니다. 객체는 true, null이나 undefined는 false입니다.
  document.querySelector("#auth-section").hidden = !!user;
  document.querySelector("#user-section").hidden = !user;
  // user?.name은 user가 없을 때도 안전합니다. 값이 없으면 ||로 빈 문자열을 사용합니다.
  document.querySelector("#user-name").textContent = user?.name || "";
  document.querySelector("#user-email").textContent = user?.email || "";
}

// setCustomValidity에 안내 문구를 넣으면 브라우저가 해당 입력란을 잘못된 것으로 판단합니다.
// 빈 문자열을 넣으면 직접 설정한 오류가 해제됩니다. 입력할 때마다 두 비밀번호를 비교합니다.
function checkPasswords() {
  confirmPassword.setCustomValidity(mode === "signup" && password.value !== confirmPassword.value ? "비밀번호가 일치하지 않습니다." : "");
}
// addEventListener는 사용자의 입력이나 클릭 같은 이벤트가 일어났을 때 실행할 함수를 연결합니다.
password.addEventListener("input", checkPasswords);
confirmPassword.addEventListener("input", checkPasswords);
document.querySelector("#login-tab").addEventListener("click", () => setMode("login"));
document.querySelector("#signup-tab").addEventListener("click", () => setMode("signup"));
document.querySelector("#switch-button").addEventListener("click", () => setMode(mode === "login" ? "signup" : "login"));

// submit은 버튼 클릭뿐 아니라 입력란에서 Enter를 눌렀을 때도 발생할 수 있습니다.
form.addEventListener("submit", async (event) => {
  // 폼의 기본 동작(다른 페이지로 이동)을 막고, 아래 fetch로 직접 데이터를 보냅니다.
  event.preventDefault();
  if (busy) return;
  checkPasswords();
  // HTML의 required, type=email, minlength와 직접 설정한 오류를 확인하고 안내를 띄웁니다.
  // 화면 검사는 편의를 위한 것이며, 서버에서도 입력값을 다시 검사합니다.
  if (!form.reportValidity()) return;
  // 요청을 시작할 때의 화면 종류와 입력값을 별도 변수에 담습니다.
  const submittedMode = mode;
  const data = { email: email.value, password: password.value };
  // 비밀번호 확인은 입력 실수를 막기 위한 것으로 서버에는 원래 비밀번호만 보냅니다.
  if (mode === "signup") data.name = document.querySelector("#name").value;
  setBusy(true);
  showMessage("");
  try {
    // 템플릿 문자열의 ${...} 부분에 값이 들어가 /api/signup 또는 /api/login이 됩니다.
    const result = await request(`/api/${submittedMode}`, data);
    setBusy(false);
    if (submittedMode === "signup") {
      // 가입 성공 후 로그인으로 전환하고 이메일을 채워 다음 동작을 쉽게 만듭니다.
      setMode("login");
      email.value = result.user.email;
      password.focus();
    } else {
      // 로그인 성공 후 입력값을 비우고 서버가 알려준 회원을 표시합니다.
      // focus는 키보드와 화면 읽기 도구가 새 화면의 시작점을 찾도록 돕습니다.
      form.reset();
      showUser(result.user);
      document.querySelector("#welcome-heading").focus();
    }
    showMessage(result.message);
  } catch (error) {
    // status가 있으면 서버가 준 실패 안내, 없으면 연결 실패 등의 통신 오류로 안내합니다.
    showMessage(error.status ? error.message : "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.", true);
  } finally {
    // finally는 성공과 실패 어느 경우에도 실행되어 버튼이 계속 잠겨 있는 일을 막습니다.
    setBusy(false);
  }
});

// 화면만 바꾸지 않고 먼저 서버에 로그아웃을 요청해 세션을 실제로 삭제합니다.
document.querySelector("#logout-button").addEventListener("click", async () => {
  setBusy(true);
  try {
    const result = await request("/api/logout", {});
    setBusy(false);
    form.reset();
    setMode("login");
    showUser(null);
    showMessage(result.message);
    email.focus();
  } catch {
    showMessage("로그아웃하지 못했습니다. 다시 시도해 주세요.", true);
  } finally {
    setBusy(false);
  }
});

// 새로고침하면 이 파일의 변수는 초기화되지만 쿠키는 유효 기간 동안 브라우저에 남아 있습니다.
// /api/me 요청에 쿠키가 함께 가면 서버가 세션을 확인해 현재 회원 정보를 반환합니다.
async function restoreSession() {
  setBusy(true);
  try {
    const result = await request("/api/me");
    showUser(result.user);
  } catch (error) {
    // 401은 아직 로그인하지 않은 정상적인 상황이므로 별도 오류 안내 없이 로그인 폼을 둡니다.
    if (error.status !== 401) showMessage("로그인 상태를 확인하지 못했습니다. 다시 시도해 주세요.", true);
  } finally {
    setBusy(false);
  }
}
// 파일을 처음 읽을 때 한 번 실행합니다. 위의 함수들은 정의만으로는 실행되지 않습니다.
restoreSession();
