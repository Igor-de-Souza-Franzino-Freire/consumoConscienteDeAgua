 const messages = [
    { max: 5,        emoji: "🐣", title: "Mal começou!",    text: "Você parou em menos de 5 segundos. Nem deu pra esquentar!" },
    { max: 15,       emoji: "⚡", title: "Rápido demais!",  text: "Entre 5 e 15 segundos. Tá com pressa hoje?" },
    { max: 30,       emoji: "🎯", title: "Bom começo.",     text: "Quase meio minuto. Você está se aquecendo." },
    { max: 60,       emoji: "🔥", title: "No ritmo!",       text: "Entre 30s e 1 minuto. Concentração no ponto certo." },
    { max: 120,      emoji: "💪", title: "Focado!",         text: "Passou de 1 minuto. Você tem disciplina de sobra." },
    { max: 300,      emoji: "🧠", title: "Modo deep work.", text: "Mais de 2 minutos sem parar. Sua mente está trabalhando forte." },
    { max: Infinity, emoji: "🏆", title: "Lendário.",       text: "Mais de 5 minutos! Você é imparável. Sério." },
  ];

  const STORAGE_KEY = "timer_historico";
  const CIRC  = 2 * Math.PI * 44;
  const CYCLE = 60;
  const CORES = ["#e8ff5a", "#5affb0", "#5ab4ff", "#ff5a8a", "#ffaa5a"];

  let elapsed = 0, interval = null, running = false;

  const digits   = document.getElementById("digits");
  const ring     = document.getElementById("ring");
  const btnStart = document.getElementById("btn-start");
  const btnStop  = document.getElementById("btn-stop");
  const btnReset = document.getElementById("btn-reset");
  const msgBox   = document.getElementById("msg-box");
  const msgEmoji = document.getElementById("msg-emoji");
  const msgTitle = document.getElementById("msg-title");
  const msgText  = document.getElementById("msg-text");
  const histWrap = document.getElementById("history-wrap");
  const histList = document.getElementById("history-list");
  const btnClear = document.getElementById("btn-clear");

  ring.style.strokeDasharray  = CIRC;
  ring.style.strokeDashoffset = CIRC;

  // ── localStorage ────────────────────────────────────
  function carregarHistorico() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function salvarHistorico(hist) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hist));
  }

  // ── Helpers ─────────────────────────────────────────
  function pad(n) { return String(n).padStart(2, "0"); }
  function formatTime(s) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }
  function getMsg(s) { return messages.find(m => s <= m.max) || messages[messages.length - 1]; }

  function updateDisplay() {
    digits.textContent = formatTime(elapsed);
    ring.style.strokeDashoffset = CIRC * (1 - (elapsed % CYCLE) / CYCLE);
    const cor = CORES[Math.floor(elapsed / CYCLE) % CORES.length];
    ring.style.stroke  = cor;
    digits.style.color = cor;
  }

  // ── Renderiza item na lista ──────────────────────────
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

  // ── Carrega histórico salvo ao abrir a página ────────
  function inicializarHistorico() {
    const hist = carregarHistorico();
    if (hist.length === 0) return;
    [...hist].reverse().forEach(entry => renderItem(entry, false));
    histWrap.style.display = "block";
  }

  // ── Salva e exibe nova entrada ───────────────────────
  function addToHistory() {
    const m     = getMsg(elapsed);
    const agora = new Date().toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit",
      hour: "2-digit", minute: "2-digit"
    });
    const entry = { time: formatTime(elapsed), emoji: m.emoji, title: m.title, clock: agora };

    const hist = carregarHistorico();
    hist.unshift(entry);
    salvarHistorico(hist);  // 💾 persiste no navegador
    renderItem(entry);
  }

  function showMessage() {
    const m = getMsg(elapsed);
    msgEmoji.textContent = m.emoji;
    msgTitle.textContent = m.title;
    msgText.textContent  = m.text;
    msgBox.classList.add("visible");
  }

  // ── Eventos ──────────────────────────────────────────
  btnStart.addEventListener("click", () => {
    if (running) return;
    running = true;
    msgBox.classList.remove("visible");
    btnStart.disabled = true;
    btnStop.disabled  = false;
    btnReset.disabled = false;
    interval = setInterval(() => { elapsed++; updateDisplay(); }, 1000);
  });

  btnStop.addEventListener("click", () => {
    if (!running) return;
    running = false;
    clearInterval(interval);
    btnStart.disabled = false;
    btnStop.disabled  = true;
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
    btnStop.disabled  = true;
    btnReset.disabled = true;
    ring.style.stroke  = CORES[0];
    digits.style.color = CORES[0];
  });

  btnClear.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY); // 🗑️ apaga do navegador
    histList.innerHTML = "";
    histWrap.style.display = "none";
  });

  // ── Init ─────────────────────────────────────────────
  updateDisplay();
  inicializarHistorico();