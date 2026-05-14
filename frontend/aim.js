const gameArea   = document.getElementById("gameArea");
const targetEl   = document.getElementById("target");
const overlay    = document.getElementById("overlay");
const resultOv   = document.getElementById("resultOverlay");
const ctrlBtn    = document.getElementById("ctrlBtn");

let hits, misses, startTime, timerLoop, running;
let targetActive = false;

// 타깃 크기 범위 (px)
const MIN_R = 18;
const MAX_R = 46;

function toggleGame() {
  if (running) {
    stopGame();
  } else {
    startGame();
  }
}

function startGame() {
  hits      = 0;
  misses    = 0;
  startTime = Date.now();
  running   = true;

  overlay.classList.add("hidden");
  resultOv.classList.add("hidden");
  ctrlBtn.textContent = "정지";
  ctrlBtn.className = ctrlBtn.className.replace("bg-green-600 hover:bg-green-500", "bg-red-600 hover:bg-red-500");

  updateStats();
  timerLoop = setInterval(updateStats, 100);
  spawnTarget();
}

function stopGame() {
  running = false;
  clearInterval(timerLoop);
  targetEl.classList.add("hidden");
  targetActive = false;

  ctrlBtn.textContent = "시작";
  ctrlBtn.className = ctrlBtn.className.replace("bg-red-600 hover:bg-red-500", "bg-green-600 hover:bg-green-500");

  showResult();
}

function spawnTarget() {
  if (!running) return;

  const r    = rand(MIN_R, MAX_R);
  const area = gameArea.getBoundingClientRect();
  const x    = rand(r + 4, area.width  - r - 4);
  const y    = rand(r + 4, area.height - r - 4);

  const size = r * 2;

  targetEl.style.width  = size + "px";
  targetEl.style.height = size + "px";
  targetEl.style.left   = x + "px";
  targetEl.style.top    = y + "px";

  // 크기별 색상: 작을수록 빨간 계열
  const ratio = (r - MIN_R) / (MAX_R - MIN_R); // 0(작음) ~ 1(큼)
  const outer = interpolateColor([239,68,68], [6,182,212], ratio);  // red → cyan
  const inner = interpolateColor([252,165,165],[165,243,252], ratio);

  targetEl.innerHTML = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${r}" cy="${r}" r="${r-1}"   fill="none" stroke="${outer}" stroke-width="2.5" opacity="0.9"/>
      <circle cx="${r}" cy="${r}" r="${r*0.55}" fill="none" stroke="${outer}" stroke-width="1.5" opacity="0.6"/>
      <circle cx="${r}" cy="${r}" r="${r*0.22}" fill="${inner}" opacity="0.95"/>
      <line x1="${r}" y1="2"      x2="${r}"      y2="${r*0.45}" stroke="${outer}" stroke-width="1.2" opacity="0.5"/>
      <line x1="${r}" y1="${r*1.55}" x2="${r}"   y2="${size-2}" stroke="${outer}" stroke-width="1.2" opacity="0.5"/>
      <line x1="2"      y1="${r}" x2="${r*0.45}" y2="${r}"     stroke="${outer}" stroke-width="1.2" opacity="0.5"/>
      <line x1="${r*1.55}" y1="${r}" x2="${size-2}" y2="${r}"  stroke="${outer}" stroke-width="1.2" opacity="0.5"/>
    </svg>`;

  targetEl.classList.remove("hidden");
  targetActive = true;
  targetEl._x = x;
  targetEl._y = y;
  targetEl._r = r;
}

function handleClick(e) {
  if (!running) return;

  const area = gameArea.getBoundingClientRect();
  const cx   = e.clientX - area.left;
  const cy   = e.clientY - area.top;

  if (targetActive) {
    const tx = targetEl._x;
    const ty = targetEl._y;
    const tr = targetEl._r;
    const dist = Math.hypot(cx - tx, cy - ty);

    if (dist <= tr) {
      // 적중
      hits++;
      showHitEffect(cx, cy, true);
      targetEl.classList.add("hidden");
      targetActive = false;
      updateStats();
      setTimeout(spawnTarget, 80);
      return;
    }
  }

  // 미스
  misses++;
  showHitEffect(cx, cy, false);
  updateStats();
}

function showHitEffect(x, y, isHit) {
  const el = document.createElement("div");
  el.style.cssText = `
    position:absolute; left:${x}px; top:${y}px;
    width:14px; height:14px; border-radius:50%;
    background:${isHit ? "#4ade80" : "#f87171"};
    transform:translate(-50%,-50%) scale(1);
    opacity:1; pointer-events:none; z-index:30;
    transition: transform 0.35s ease-out, opacity 0.35s ease-out;
  `;
  gameArea.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = "translate(-50%,-50%) scale(3)";
    el.style.opacity   = "0";
  });
  setTimeout(() => el.remove(), 380);
}

function updateStats() {
  const elapsed = (Date.now() - startTime) / 1000;
  const total   = hits + misses;
  const acc     = total > 0 ? ((hits / total) * 100).toFixed(1) : "—";
  const hps     = elapsed > 0 ? (hits / elapsed).toFixed(2) : "0.00";

  document.getElementById("statTime").textContent     = elapsed.toFixed(1) + " s";
  document.getElementById("statScore").textContent    = hps + " /s";
  document.getElementById("statAccuracy").textContent = acc + (acc === "—" ? "" : " %");
  document.getElementById("statHits").textContent     = hits + " / " + misses;
}

function showResult() {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const total   = hits + misses;
  const acc     = total > 0 ? ((hits / total) * 100).toFixed(1) : 0;
  const hps     = elapsed > 0 ? (hits / elapsed).toFixed(2) : "0.00";

  document.getElementById("resultText").innerHTML = `
    <p class="text-gray-300">시간: <span class="text-white font-bold">${elapsed}초</span></p>
    <p class="text-gray-300">적중: <span class="text-green-400 font-bold">${hits}회</span> &nbsp; 미스: <span class="text-red-400 font-bold">${misses}회</span></p>
    <p class="text-gray-300">정확도: <span class="text-blue-400 font-bold">${acc}%</span></p>
    <p class="text-gray-300">평균 속도: <span class="text-yellow-400 font-bold">${hps} 적중/초</span></p>
  `;
  resultOv.classList.remove("hidden");
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function interpolateColor(c1, c2, t) {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return `rgb(${r},${g},${b})`;
}
