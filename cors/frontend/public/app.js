const loadButton = document.querySelector("#loadButton");
const message = document.querySelector("#message");
const dashboard = document.querySelector("#dashboard");
const summary = document.querySelector("#summary");
const projectList = document.querySelector("#projectList");
const updatedAt = document.querySelector("#updatedAt");
const serverStatus = document.querySelector(".server-status");

function formatNumber(number) {
  return number.toLocaleString("ko-KR");
}

function showSummary(items) {
  summary.innerHTML = items.map((item) => `
    <article class="summary-card">
      <p>${item.label}</p>
      <strong>${formatNumber(item.value)}<small>${item.unit}</small></strong>
      <span>${item.change}</span>
    </article>
  `).join("");
}

function showProjects(projects) {
  projectList.innerHTML = projects.map((project) => `
    <tr>
      <td>
        <strong>${project.name}</strong>
        <small>${project.id} · ${project.client}</small>
      </td>
      <td>${project.manager}</td>
      <td><span class="status">${project.status}</span></td>
      <td>
        <div class="progress-label">${project.progress}%</div>
        <div class="progress"><span style="width: ${project.progress}%"></span></div>
      </td>
      <td>${formatNumber(project.budget)}만원</td>
      <td>${project.deadline}</td>
    </tr>
  `).join("");
}

loadButton.addEventListener("click", async () => {
  message.textContent = "API 서버에서 데이터를 불러오는 중입니다...";

  // 현재 페이지는 3000번 포트지만 데이터는 4000번 포트의 API에 요청합니다.
  const response = await fetch("http://localhost:4000/api/dashboard");
  const data = await response.json();

  showSummary(data.summary);
  showProjects(data.projects);
  updatedAt.textContent = `업데이트 ${data.updatedAt}`;
  message.textContent = `${data.company}의 최신 데이터를 불러왔습니다.`;
  serverStatus.textContent = "● API 연결됨";
  serverStatus.classList.add("connected");
  dashboard.hidden = false;
});
