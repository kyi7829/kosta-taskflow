const API_URL = "/api/tasks";

// 상태 표시 설정
const statusConfig = {
  todo:        { label: "할 일",    color: "bg-gray-200 text-gray-700" },
  in_progress: { label: "진행 중",  color: "bg-blue-200 text-blue-700" },
  done:        { label: "완료",     color: "bg-green-200 text-green-700" },
};

// 다음 상태 순환
const nextStatus = { todo: "in_progress", in_progress: "done", done: "todo" };

async function fetchTasks() {
  const res = await fetch(API_URL);
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  if (tasks.length === 0) {
    list.innerHTML = `<p class="text-center text-gray-400 py-8">등록된 업무가 없습니다.</p>`;
    return;
  }

  tasks.forEach(task => {
    const cfg = statusConfig[task.status];
    const card = document.createElement("div");
    card.className = "flex items-center justify-between bg-white rounded-lg shadow px-5 py-4";
    card.innerHTML = `
      <span class="text-gray-800 font-medium flex-1">${escapeHtml(task.title)}</span>
      <button
        onclick="changeStatus(${task.id}, '${task.status}')"
        class="ml-4 px-3 py-1 rounded-full text-sm font-semibold ${cfg.color} hover:opacity-80 transition"
      >${cfg.label}</button>
      <button
        onclick="deleteTask(${task.id})"
        class="ml-3 px-3 py-1 rounded-lg text-sm text-red-500 hover:bg-red-50 transition"
      >삭제</button>
    `;
    list.appendChild(card);
  });
}

async function addTask() {
  const input = document.getElementById("taskInput");
  const title = input.value.trim();
  if (!title) return;

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  input.value = "";
  fetchTasks();
}

async function changeStatus(taskId, currentStatus) {
  await fetch(`${API_URL}/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: nextStatus[currentStatus] }),
  });
  fetchTasks();
}

async function deleteTask(taskId) {
  await fetch(`${API_URL}/${taskId}`, { method: "DELETE" });
  fetchTasks();
}

// XSS 방지
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Enter 키로 추가
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("taskInput").addEventListener("keydown", e => {
    if (e.key === "Enter") addTask();
  });
  fetchTasks();
});
