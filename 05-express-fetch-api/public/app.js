const statusText = document.querySelector("#statusText");
const messageList = document.querySelector("#messageList");
const reloadButton = document.querySelector("#reloadButton");

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
}

function createMessageCard(message) {
  const item = document.createElement("li");
  const meta = document.createElement("p");
  const title = document.createElement("h3");
  const body = document.createElement("p");

  item.className = "message-card";
  meta.className = "meta";

  meta.textContent = `#${message.id} · ${message.author}`;
  title.textContent = message.title;
  body.textContent = message.body;

  item.append(meta, title, body);

  return item;
}

async function loadMessages() {
  reloadButton.disabled = true;
  messageList.replaceChildren();
  setStatus("메시지를 불러오는 중입니다.");

  try {
    const response = await fetch("/api/messages");

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const messages = await response.json();
    const cards = messages.map(createMessageCard);

    messageList.replaceChildren(...cards);
    setStatus(`${messages.length}개의 메시지를 불러왔습니다.`);
  } catch (error) {
    console.error(error);
    setStatus("메시지를 불러오지 못했습니다. 서버가 실행 중인지 확인해주세요.", true);
  } finally {
    reloadButton.disabled = false;
  }
}

reloadButton.addEventListener("click", loadMessages);
loadMessages();
