import { createInitialState, jump, startGame, stepGameState } from "./game.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreLabel = document.getElementById("score");
const bestLabel = document.getElementById("best");

const playerImages = [new Image(), new Image(), new Image(), new Image()];
playerImages[0].src = "./jimothy_1.png";
playerImages[1].src = "./jimothy_2.png";
playerImages[2].src = "./jimothy_3.png";
playerImages[3].src = "./jimothy_4.png";

let state = createInitialState(canvas.width, canvas.height);
let lastTime = 0;
let spriteFrame = 0;
let spriteTimer = 0;
let bestScore = 0;

function resetGame() {
  state = startGame(createInitialState(canvas.width, canvas.height));
}

function handleJump() {
  if (state.status === "ready") {
    state = startGame(state);
    state = jump(state);
  } else if (state.status === "running") {
    state = jump(state);
  } else {
    resetGame();
  }
}

function drawSky() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#0f1728");
  sky.addColorStop(0.45, "#1b2f49");
  sky.addColorStop(1, "#4d6a7d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  for (let i = 0; i < 30; i += 1) {
    const x = (i * 97) % canvas.width;
    const y = (i * 73) % 180;
    ctx.fillRect(x, y + 20, 2, 2);
  }
}

function drawCityscape() {
  const buildings = [
    { x: -24, width: 72, height: 168, color: "#1a2338" },
    { x: 80, width: 64, height: 208, color: "#131c2e" },
    { x: 180, width: 84, height: 132, color: "#19243d" },
    { x: 292, width: 56, height: 194, color: "#1d2d46" },
    { x: 380, width: 90, height: 156, color: "#172235" },
    { x: 495, width: 72, height: 214, color: "#111b2c" },
    { x: 598, width: 64, height: 152, color: "#19253e" },
    { x: 690, width: 86, height: 182, color: "#152036" },
    { x: 806, width: 78, height: 126, color: "#1e2e44" },
    { x: 910, width: 74, height: 160, color: "#18233a" },
  ];

  ctx.save();
  ctx.translate(-state.backgroundOffset, 0);

  buildings.forEach((building, index) => {
    const x = building.x + index * 24;
    ctx.fillStyle = building.color;
    ctx.fillRect(x, canvas.height - 300 - building.height, building.width, building.height);

    ctx.fillStyle = "#f6cf5d";
    for (let row = 0; row < 6; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        if ((row + col + index) % 3 !== 0) {
          ctx.fillRect(x + 10 + col * 12, canvas.height - 300 - building.height + 16 + row * 18, 4, 4);
        }
      }
    }
  });

  ctx.restore();
}

function drawGround() {
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, state.groundY, canvas.width, canvas.height - state.groundY);

  ctx.fillStyle = "#d8dae2";
  for (let x = 0; x < canvas.width; x += 36) {
    ctx.fillRect(x + (state.backgroundOffset % 36), state.groundY + 10, 18, 4);
  }
}

function drawObstacle(obstacle) {
  const baseY = state.groundY - obstacle.height;
  if (obstacle.kind === "car") {
    ctx.fillStyle = "#d44a3e";
    ctx.fillRect(obstacle.x, baseY, obstacle.width, obstacle.height);
    ctx.fillStyle = "#f4d35e";
    ctx.fillRect(obstacle.x + 8, baseY + 8, obstacle.width - 16, 10);
    ctx.fillStyle = "#0a0f1a";
    ctx.fillRect(obstacle.x + 8, baseY + 20, 10, 10);
    ctx.fillRect(obstacle.x + obstacle.width - 18, baseY + 20, 10, 10);
  } else {
    ctx.fillStyle = "#ffb703";
    ctx.beginPath();
    ctx.moveTo(obstacle.x, baseY + obstacle.height);
    ctx.lineTo(obstacle.x + obstacle.width / 2, baseY);
    ctx.lineTo(obstacle.x + obstacle.width, baseY + obstacle.height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0a0f1a";
    ctx.fillRect(obstacle.x + 8, baseY + 16, obstacle.width - 16, 8);
  }
}

function drawPlayer() {
  const sprite = playerImages[spriteFrame];
  const player = state.player;

  if (sprite && sprite.complete) {
    ctx.drawImage(sprite, player.x, player.y, player.width, player.height);
  } else {
    ctx.fillStyle = "#7cf8b2";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = "#0d1326";
    ctx.fillRect(player.x + 18, player.y + 18, 8, 8);
    ctx.fillRect(player.x + 38, player.y + 18, 8, 8);
  }
}

function drawOverlay() {
  if (state.status === "ready") {
    ctx.fillStyle = "rgba(7, 13, 24, 0.72)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fef8cf";
    ctx.font = "700 34px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Ready to run?", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "24px 'Trebuchet MS', sans-serif";
    ctx.fillText("Press jump to start", canvas.width / 2, canvas.height / 2 + 18);
  } else if (state.status === "gameover") {
    ctx.fillStyle = "rgba(7, 13, 24, 0.72)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ff7b72";
    ctx.font = "700 36px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game over", canvas.width / 2, canvas.height / 2 - 24);
    ctx.font = "24px 'Trebuchet MS', sans-serif";
    ctx.fillStyle = "#fef8cf";
    ctx.fillText(`Score: ${Math.floor(state.score)}`, canvas.width / 2, canvas.height / 2 + 12);
    ctx.fillText("Tap or press jump to retry", canvas.width / 2, canvas.height / 2 + 46);
  }
}

function draw() {
  drawSky();
  drawCityscape();
  drawGround();
  state.obstacles.forEach(drawObstacle);
  drawPlayer();
  drawOverlay();

  scoreLabel.textContent = Math.floor(state.score).toString();
  bestLabel.textContent = Math.floor(bestScore).toString();
}

function tick(timestamp) {
  if (!lastTime) {
    lastTime = timestamp;
  }

  const delta = Math.min(0.032, (timestamp - lastTime) / 1000);
  lastTime = timestamp;

  if (state.status === "running") {
    state = stepGameState(state, delta);
    bestScore = Math.max(bestScore, state.score);
    spriteTimer += delta;
    if (spriteTimer >= 0.12) {
      spriteTimer = 0;
      spriteFrame = spriteFrame === 0 ? 1 : 0;
    }
  }

  draw();
  requestAnimationFrame(tick);
}

window.addEventListener("keydown", (event) => {
  if (["Space", "ArrowUp", "KeyW"].includes(event.code)) {
    event.preventDefault();
    handleJump();
  }
  if (event.code === "Enter" && state.status === "gameover") {
    resetGame();
  }
});

canvas.addEventListener("pointerdown", () => {
  handleJump();
});

requestAnimationFrame(tick);
