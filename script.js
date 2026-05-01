let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const addBtn = document.getElementById("addBtn");
const darkBtn = document.getElementById("darkBtn");
const search = document.getElementById("search");

let dragIndex = null;

/* ADD TASK */
addBtn.onclick = addTask;

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({
    text,
    done: false,
    date: ""   // due date
  });

  taskInput.value = "";
  save();
  displayTasks();
}

/* SAVE */
function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* DISPLAY */
function displayTasks(filter = "all") {
  taskList.innerHTML = "";

  let filtered = tasks.filter(task => {
    if (filter === "active") return !task.done;
    if (filter === "done") return task.done;
    return true;
  });

  filtered = filtered.filter(t =>
    t.text.toLowerCase().includes(search.value.toLowerCase())
  );

  filtered.forEach((task, index) => {
    const li = document.createElement("li");
    li.draggable = true;

    li.innerHTML = `
      <input type="checkbox" ${task.done ? "checked" : ""} onclick="toggleTask(${index})">

      <span class="task-text ${task.done ? "done" : ""}">
        ${task.text}
      </span>

      <input type="date" value="${task.date || ""}" onchange="setDate(${index}, this.value)">

      <div class="btns">
        <button class="edit" onclick="editTask(${index})">✏️</button>
        <button class="delete" onclick="deleteTask(${index})">❌</button>
      </div>
    `;

    /* DRAG EVENTS */
    li.ondragstart = () => dragIndex = index;

    li.ondragover = e => e.preventDefault();

    li.ondrop = () => {
      const dragged = tasks[dragIndex];
      tasks.splice(dragIndex, 1);
      tasks.splice(index, 0, dragged);
      save();
      displayTasks();
    };

    taskList.appendChild(li);
  });
}

/* TOGGLE */
function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  save();
  displayTasks();
}

/* DELETE */
function deleteTask(index) {
  tasks.splice(index, 1);
  save();
  displayTasks();
}

/* EDIT */
function editTask(index) {
  const newText = prompt("Edit task:", tasks[index].text);
  if (newText && newText.trim()) {
    tasks[index].text = newText.trim();
    save();
    displayTasks();
  }
}

/* DATE */
function setDate(index, value) {
  tasks[index].date = value;
  save();
}

/* FILTER */
function filterTasks(type) {
  displayTasks(type);
}

/* SEARCH */
search.oninput = () => displayTasks();

/* KEYBOARD SHORTCUTS */
document.addEventListener("keydown", e => {
  if (e.key === "/") {
    e.preventDefault();
    search.focus();
  }
});

/* EXPORT JSON */
function exportTasks() {
  const data = JSON.stringify(tasks, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "tasks.json";
  a.click();
}

/* IMPORT JSON */
function importTasks(file) {
  const reader = new FileReader();
  reader.onload = e => {
    tasks = JSON.parse(e.target.result);
    save();
    displayTasks();
  };
  reader.readAsText(file);
}

/* ENTER KEY */
taskInput.addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});

/* DARK MODE */
if (localStorage.getItem("mode") === "dark") {
  document.body.classList.add("dark");
  darkBtn.innerText = "☀️ Light Mode";
}

darkBtn.onclick = () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("mode", "dark");
    darkBtn.innerText = "☀️ Light Mode";
  } else {
    localStorage.setItem("mode", "light");
    darkBtn.innerText = "🌙 Dark Mode";
  }
};

/* INIT */
displayTasks();