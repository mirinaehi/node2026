const messageForm = document.querySelector("#messageForm");
const titleInput = document.querySelector("#titleInput");
const bodyInput = document.querySelector("#bodyInput");
const statusText = document.querySelector("#statusText");
const messageList = document.querySelector("#messageList");
const reloadButton = document.querySelector("#reloadButton");

function setStatus(message, type = "normal") {
  statusText.textContent = message;
  statusText.classList.toggle("error", type === "error");
  statusText.classList.toggle("success", type === "success");
}

function createMessageCard(message) {
  const item = document.createElement("li");
  const meta = document.createElement("p");
  const title = document.createElement("h3");
  const body = document.createElement("p");

  item.className = "message-card";
  meta.className = "meta";

  meta.textContent = `#${message.id}`;
  title.textContent = message.title;
  body.textContent = message.body;

  item.append(meta, title, body);

  return item;
}

async function loadMessages() {
  reloadButton.disabled = true;
  setStatus("메시지를 불러오는 중입니다.");

  try {
    const response = await fetch("/api/messages");

    if (!response.ok) {
      throw new Error(`목록 요청 실패: ${response.status}`);
    }

    const messages = await response.json();
    const cards = messages.map(createMessageCard);

    messageList.replaceChildren(...cards);
    setStatus(`${messages.length}개의 메시지를 불러왔습니다.`, "success");
  } catch (error) {
    console.error(error);
    setStatus("메시지 목록을 불러오지 못했습니다.", "error");
  } finally {
    reloadButton.disabled = false;
  }
}

async function createMessage(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title || !body) {
    setStatus("제목과 내용을 모두 입력해주세요.", "error");
    return;
  }

  const submitButton = messageForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  setStatus("새 메시지를 서버로 보내는 중입니다.");

  try {
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `추가 요청 실패: ${response.status}`);
    }

    messageForm.reset();
    setStatus(`${result.id}번 메시지를 추가했습니다.`, "success");
    await loadMessages();
  } catch (error) {
    console.error(error);
    setStatus(error.message, "error");
  } finally {
    submitButton.disabled = false;
  }
}

messageForm.addEventListener("submit", createMessage);
reloadButton.addEventListener("click", loadMessages);
loadMessages();

