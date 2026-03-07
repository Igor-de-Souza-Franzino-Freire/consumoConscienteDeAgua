const messages = [
  {
    max: 60,
    emoji: "",
    title: "Rápido demais!",
    text: "Tem certeza que tomou banho de verdade?",
  },
  {
    max: 120,
    emoji: "",
    title: "Uau, foi um banho bem rápido!",
    text: "Menos de 2 minutos de banho? Se você realmente tomou banho, parabéns!",
  },
  {
    max: 300,
    emoji: "",
    title: "Ideal!",
    text: "O tempo máximo ideal de banho para economizar água e energia é de 5 minutos ou menos. Banhos nessa duração consomem cerca de 30 a 40 litros",
  },
  {
    max: 420,
    emoji: "",
    title: "Um bom tempo!",
    text: "Se quiser economizar água e energia, tente manter seus banhos dentro deste tempo.",
  },
  {
    max: 480,
    emoji: "",
    title: "Precisa de todo esse tempo mesmo?",
    text: "Você gasta em cerca de 90 litros de água em um banho de 8 a 10 minutos, tente melhorar seu tempo para economizar mais água.",
  },
  {
    max: 780,
    emoji: "",
    title: "Cuidado com esse tempo!",
    text: "Entre 10 a 13 minutos de banho você gasta cerca de 120 litros de água. Tente ir aos poucos diminuindo seu tempo de banho.",
  },
  {
    max: 900,
    emoji: "",
    title: "Pare pare pare",
    text: "Você está ganstando cerca de 140 litros de água, isso é demais para um banho só. Gastando isso todos os dias, você estará gastando cerca de 4200 litros de água por mês, são 4,2 toneladas de água.",
  },
  {
    max: Infinity,
    emoji: "",
    title: "Pare pare pare",
    text: "Você está ganstando cerca de 140 litros de água, isso é demais para um banho só. Gastando isso todos os dias, você estará gastando cerca de 4200 litros de água por mês, são 4,2 toneladas de água.",
  },
];

const STORAGE_KEY = "timer_historico";
const CIRC = 2 * Math.PI * 44;
const CYCLE = 60;
const CORES = [
  "#efe4ae",
  "#5aff8c",
  "#71ff8d",
  "#61ffea",
  "#fda654",
  "#ff8000",
  "#ff0000",
];

let elapsed = 0,
  interval = null,
  running = false;

const digits = document.getElementById("digits");
const ring = document.getElementById("ring");
const btnStart = document.getElementById("btn-start");
const btnStop = document.getElementById("btn-stop");
const btnReset = document.getElementById("btn-reset");
const msgBox = document.getElementById("msg-box");
const msgEmoji = document.getElementById("msg-emoji");
const msgTitle = document.getElementById("msg-title");
const msgText = document.getElementById("msg-text");
const histWrap = document.getElementById("history-wrap");
const histList = document.getElementById("history-list");
const btnClear = document.getElementById("btn-clear");

ring.style.strokeDasharray = CIRC;
ring.style.strokeDashoffset = CIRC;

// localStorage para historico
function carregarHistorico() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function salvarHistorico(hist) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hist));
}

function pad(n) {
  return String(n).padStart(2, "0");
}
function formatTime(s) {
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}
function getMsg(s) {
  return messages.find((m) => s <= m.max) || messages[messages.length - 1];
}

function updateDisplay() {
  digits.textContent = formatTime(elapsed);
  ring.style.strokeDashoffset = CIRC * (1 - (elapsed % CYCLE) / CYCLE);
  const cor = CORES[Math.floor(elapsed / CYCLE) % CORES.length];
  ring.style.stroke = cor;
  digits.style.color = cor;
}

function renderItem(entry, prepend = true) {
  const item = document.createElement("div");
  item.className = "history-item";
  item.innerHTML = `
      <span class="h-emoji">${entry.emoji}</span>
      <div class="h-info">
        <div class="h-time">${entry.time}</div>
        <div class="h-label">${entry.title}</div>
      </div>
      <span class="h-clock">${entry.clock}</span>
    `;
  prepend ? histList.prepend(item) : histList.append(item);
  histWrap.style.display = "block";
}

// Carrega histórico salvo ao abrir a página
function inicializarHistorico() {
  const hist = carregarHistorico();
  if (hist.length === 0) return;
  [...hist].reverse().forEach((entry) => renderItem(entry, false));
  histWrap.style.display = "block";
}

// Salva e exibe nova entrada
function addToHistory() {
  const m = getMsg(elapsed);
  const agora = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const entry = {
    time: formatTime(elapsed),
    emoji: m.emoji,
    title: m.title,
    clock: agora,
  };

  const hist = carregarHistorico();
  hist.unshift(entry);
  salvarHistorico(hist); // persiste no navegador
  renderItem(entry);
}

function showMessage() {
  const m = getMsg(elapsed);
  msgEmoji.textContent = m.emoji;
  msgTitle.textContent = m.title;
  msgText.textContent = m.text;
  msgBox.classList.add("visible");
}

// ── Eventos ──────────────────────────────────────────
btnStart.addEventListener("click", () => {
  if (running) return;
  running = true;
  msgBox.classList.remove("visible");
  btnStart.disabled = true;
  btnStop.disabled = false;
  btnReset.disabled = false;
  interval = setInterval(() => {
    elapsed++;
    updateDisplay();
  }, 1000);
});

btnStop.addEventListener("click", () => {
  if (!running) return;
  running = false;
  clearInterval(interval);
  btnStart.disabled = false;
  btnStop.disabled = true;
  showMessage();
  addToHistory();
});

btnReset.addEventListener("click", () => {
  running = false;
  clearInterval(interval);
  elapsed = 0;
  updateDisplay();
  msgBox.classList.remove("visible");
  btnStart.disabled = false;
  btnStop.disabled = true;
  btnReset.disabled = true;
  ring.style.stroke = CORES[0];
  digits.style.color = CORES[0];
});

btnClear.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY); // apaga do navegador
  histList.innerHTML = "";
  histWrap.style.display = "none";
});

updateDisplay();
inicializarHistorico();
