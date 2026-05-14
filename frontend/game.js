const CELL = 20;           // 셀 크기(px)
const COLS = 20;           // 가로 칸 수
const ROWS = 20;           // 세로 칸 수
const INTERVAL = 120;      // 게임 속도(ms)

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let snake, dir, nextDir, food, score, highScore, loop, running;

highScore = 0;

function startGame() {
  // 초기 상태
  snake = [
    { x: 10, y: 10 },
    { x: 9,  y: 10 },
    { x: 8,  y: 10 },
  ];
  dir     = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score   = 0;
  running = true;

  document.getElementById("overlay").classList.add("hidden");
  document.getElementById("score").textContent = 0;

  spawnFood();
  clearInterval(loop);
  loop = setInterval(tick, INTERVAL);
}

function tick() {
  dir = nextDir;

  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // 벽 충돌
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    return gameOver();
  }
  // 자기 몸 충돌
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    return gameOver();
  }

  snake.unshift(head);

  // 먹이 먹기
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("score").textContent = score;
    if (score > highScore) {
      highScore = score;
      document.getElementById("highScore").textContent = highScore;
    }
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function spawnFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

function draw() {
  // 배경
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 격자 (옅게)
  ctx.strokeStyle = "#1f2937";
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL, 0);
    ctx.lineTo(i * CELL, canvas.height);
    ctx.stroke();
  }
  for (let j = 0; j <= ROWS; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * CELL);
    ctx.lineTo(canvas.width, j * CELL);
    ctx.stroke();
  }

  // 지렁이
  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? "#4ade80" : "#16a34a";
    ctx.beginPath();
    ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4);
    ctx.fill();
  });

  // 눈 (머리)
  const h = snake[0];
  ctx.fillStyle = "#111827";
  const eyeOffset = CELL * 0.28;
  const eyeSize   = CELL * 0.15;
  // 방향에 따라 눈 위치 조정
  if (dir.x === 1) {
    ctx.beginPath(); ctx.arc(h.x * CELL + CELL * 0.75, h.y * CELL + CELL * 0.3, eyeSize, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(h.x * CELL + CELL * 0.75, h.y * CELL + CELL * 0.7, eyeSize, 0, Math.PI * 2); ctx.fill();
  } else if (dir.x === -1) {
    ctx.beginPath(); ctx.arc(h.x * CELL + CELL * 0.25, h.y * CELL + CELL * 0.3, eyeSize, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(h.x * CELL + CELL * 0.25, h.y * CELL + CELL * 0.7, eyeSize, 0, Math.PI * 2); ctx.fill();
  } else if (dir.y === -1) {
    ctx.beginPath(); ctx.arc(h.x * CELL + CELL * 0.3, h.y * CELL + CELL * 0.25, eyeSize, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(h.x * CELL + CELL * 0.7, h.y * CELL + CELL * 0.25, eyeSize, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(h.x * CELL + CELL * 0.3, h.y * CELL + CELL * 0.75, eyeSize, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(h.x * CELL + CELL * 0.7, h.y * CELL + CELL * 0.75, eyeSize, 0, Math.PI * 2); ctx.fill();
  }

  // 먹이
  ctx.fillStyle = "#f87171";
  ctx.beginPath();
  ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
}

function gameOver() {
  clearInterval(loop);
  running = false;

  const overlay = document.getElementById("overlay");
  document.getElementById("overlayTitle").textContent = "게임 오버";
  document.getElementById("overlayMsg").textContent   = `점수: ${score}`;
  document.getElementById("startBtn").textContent     = "다시 시작";
  overlay.classList.remove("hidden");
}

// 키 입력
document.addEventListener("keydown", e => {
  if (!running) return;
  const map = {
    ArrowUp:    { x:  0, y: -1 },
    ArrowDown:  { x:  0, y:  1 },
    ArrowLeft:  { x: -1, y:  0 },
    ArrowRight: { x:  1, y:  0 },
    w: { x:  0, y: -1 },
    s: { x:  0, y:  1 },
    a: { x: -1, y:  0 },
    d: { x:  1, y:  0 },
  };
  const newDir = map[e.key];
  if (!newDir) return;
  // 반대 방향 전환 방지
  if (newDir.x === -dir.x && newDir.y === -dir.y) return;
  e.preventDefault();
  nextDir = newDir;
});

// 초기 화면 그리기
ctx.fillStyle = "#111827";
ctx.fillRect(0, 0, canvas.width, canvas.height);
