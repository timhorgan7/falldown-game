const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 320;
let height = 480;

canvas.width = width;
canvas.height = height;

let player = {
  x: width / 2 - 15,
  y: height / 2 - 15,
  w: 30,
  h: 30,
  speed: 5,
  dx: 0,
  dy: 0,
};

let minGapWidth = player.w + 10;
// Make lines closer together (but not too tight)
let platformGap = player.h * 1.7; // adjust as needed for "slightly closer"
let platformHeight = 10;
let initialPlatformSpeed = 2;
let platformSpeed = initialPlatformSpeed;
let gravity = 1.7;
let maxPlatformSpeed = 10;

let isGameOver = false;
let score = 0;
const maxScore = 100000; // 100,000 lines to "win"

function resetGame() {
  player.x = width / 2 - player.w / 2;
  player.y = height / 2 - player.h / 2;
  player.dx = 0;
  player.dy = 0;
  isGameOver = false;
  score = 0;
  platformSpeed = initialPlatformSpeed;
  platforms = [];
  for (let y = 0; y < height; y += platformGap) {
    createPlatform(y);
  }
  document.getElementById('game-over').classList.add('hidden');
}

function createPlatform(y) {
  const gapWidth = minGapWidth + Math.random() * (width / 2 - minGapWidth);
  const gapX = Math.random() * (width - gapWidth);
  platforms.push({ y, gapX, gapWidth, scored: false });
}

let platforms = [];

function updatePlatforms() {
  for (let plat of platforms) {
    plat.y += platformSpeed;
  }
  while (platforms.length && platforms[0].y > height) {
    platforms.shift();
    createPlatform(platforms[platforms.length - 1].y - platformGap);
  }
  for (let plat of platforms) {
    if (!plat.scored && plat.y > player.y + player.h) {
      score++;
      plat.scored = true;
      // Increase speed every 10 lines, capped at maxPlatformSpeed
      if (score % 10 === 0 && platformSpeed < maxPlatformSpeed) {
        platformSpeed += 0.1; // adjust increment for challenge
        if (platformSpeed > maxPlatformSpeed) platformSpeed = maxPlatformSpeed;
      }
      if (score >= maxScore) {
        isGameOver = true;
        document.getElementById('game-over').classList.remove('hidden');
      }
    }
  }
}

function drawPlatforms() {
  ctx.fillStyle = '#4caf50';
  for (let plat of platforms) {
    ctx.fillRect(0, plat.y, plat.gapX, platformHeight);
    ctx.fillRect(plat.gapX + plat.gapWidth, plat.y, width - plat.gapX - plat.gapWidth, platformHeight);
  }
}

function drawPlayer() {
  ctx.fillStyle = '#ff6f00';
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function updatePlayer() {
  player.x += player.dx;
  player.y += player.dy;

  if (player.x < 0) player.x = 0;
  if (player.x + player.w > width) player.x = width - player.w;
  if (player.y < 0) player.y = 0;
  if (player.y + player.h > height) player.y = height - player.h;

  player.y += gravity;

  for (let plat of platforms) {
    if (
      player.y + player.h > plat.y &&
      player.y < plat.y + platformHeight
    ) {
      if (player.x < plat.gapX || player.x + player.w > plat.gapX + plat.gapWidth) {
        player.y = plat.y + platformHeight;
        player.y += 2;
      }
    }
  }
}

function checkGameOver() {
  if (player.y + player.h >= height) {
    isGameOver = true;
    document.getElementById('game-over').classList.remove('hidden');
  }
}

function drawScore() {
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText(`Score: ${score}`, 10, 28);
  ctx.font = '14px sans-serif';
  ctx.fillText(`Goal: ${maxScore}`, 10, 46);
}

function loop() {
  ctx.clearRect(0, 0, width, height);
  updatePlatforms();
  updatePlayer();
  drawPlatforms();
  drawPlayer();
  drawScore();
  checkGameOver();

  if (!isGameOver) {
    requestAnimationFrame(loop);
  }
}

// Keyboard Controls
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = -player.speed;
  if (e.key === 'ArrowRight' || e.key === 'd') player.dx = player.speed;
  if (e.key === 'ArrowUp' || e.key === 'w') player.dy = -player.speed;
  if (e.key === 'ArrowDown' || e.key === 's') player.dy = player.speed;
});
window.addEventListener('keyup', e => {
  if ((e.key === 'ArrowLeft' && player.dx < 0) || (e.key === 'a' && player.dx < 0)) player.dx = 0;
  if ((e.key === 'ArrowRight' && player.dx > 0) || (e.key === 'd' && player.dx > 0)) player.dx = 0;
  if ((e.key === 'ArrowUp' && player.dy < 0) || (e.key === 'w' && player.dy < 0)) player.dy = 0;
  if ((e.key === 'ArrowDown' && player.dy > 0) || (e.key === 's' && player.dy > 0)) player.dy = 0;
});

// Universal Touch Controls
let touchActive = false;
function handleTouch(x, y) {
  const moveH = x < width / 2 ? -player.speed : player.speed;
  const moveV = y < height / 2 ? -player.speed : player.speed;
  player.dx = Math.abs(x - width/2) > 20 ? moveH : 0;
  player.dy = Math.abs(y - height/2) > 20 ? moveV : 0;
}
canvas.addEventListener('touchstart', e => {
  touchActive = true;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  handleTouch(x, y);
});
canvas.addEventListener('touchmove', e => {
  if (!touchActive) return;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  handleTouch(x, y);
});
canvas.addEventListener('touchend', e => {
  touchActive = false;
  player.dx = 0;
  player.dy = 0;
});

// Also support mouse for desktop play
canvas.addEventListener('mousedown', e => {
  touchActive = true;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  handleTouch(x, y);
});
canvas.addEventListener('mousemove', e => {
  if (!touchActive) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  handleTouch(x, y);
});
canvas.addEventListener('mouseup', e => {
  touchActive = false;
  player.dx = 0;
  player.dy = 0;
});

function restartGame() {
  resetGame();
  loop();
}

resetGame();
loop();