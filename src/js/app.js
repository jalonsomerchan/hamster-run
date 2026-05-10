import '../css/main.css';

import hamsterSheet from '../assets/sprites/hamster/sheet-transparent.png';
import peanutSheet from '../assets/sprites/peanut/sheet-transparent.png';
import enemySheet from '../assets/sprites/enemy/sheet-transparent.png';
import platformWoodLong from '../assets/sprites/platforms/platform-1.png';
import platformWoodMedium from '../assets/sprites/platforms/platform-2.png';
import platformWoodShort from '../assets/sprites/platforms/platform-3.png';
import platformDirt from '../assets/sprites/platforms/platform-4.png';
import platformStraw from '../assets/sprites/platforms/platform-5.png';
import platformMushroom from '../assets/sprites/platforms/platform-6.png';
import cloudSprite from '../assets/sprites/background/background-1.png';
import treeSprite from '../assets/sprites/background/background-2.png';
import hillSprite from '../assets/sprites/background/background-3.png';
import barnSprite from '../assets/sprites/background/background-4.png';
import moonSprite from '../assets/sprites/background/background-5.png';
import haySprite from '../assets/sprites/background/background-6.png';
import thistleSprite from '../assets/sprites/environment/environment-3.png';
import grassSprite from '../assets/sprites/environment/environment-4.png';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');

const scoreEl = document.querySelector('#score');
const peanutsEl = document.querySelector('#peanuts');
const timeEl = document.querySelector('#time');
const menu = document.querySelector('#menu');
const gameOver = document.querySelector('#gameOver');
const levelGrid = document.querySelector('#levelGrid');
const startButton = document.querySelector('#startButton');
const retryButton = document.querySelector('#retryButton');
const levelsButton = document.querySelector('#levelsButton');
const finalScore = document.querySelector('#finalScore');
const finalPeanuts = document.querySelector('#finalPeanuts');
const finalTime = document.querySelector('#finalTime');

const levels = [
  {
    id: 'meadow',
    name: 'Pradera',
    detail: 'Saltos amplios y ritmo amable',
    tag: 'Fácil',
    speed: 210,
    gravity: 1780,
    jump: 700,
    enemyChance: 0.22,
    startGap: [70, 116],
    gap: [98, 160],
    startWidth: [230, 320],
    width: [185, 295],
    startVertical: 24,
    vertical: 58,
    palette: ['#91d8ea', '#bcebc7', '#f5cb6b'],
  },
  {
    id: 'barn',
    name: 'Granero',
    detail: 'Más enemigos y huecos cortos',
    tag: 'Medio',
    speed: 230,
    gravity: 1880,
    jump: 720,
    enemyChance: 0.32,
    startGap: [78, 126],
    gap: [108, 178],
    startWidth: [220, 310],
    width: [170, 270],
    startVertical: 28,
    vertical: 66,
    palette: ['#7bc6d8', '#edc486', '#d4733e'],
  },
  {
    id: 'moon',
    name: 'Noche',
    detail: 'Carrera rápida y plataformas tensas',
    tag: 'Difícil',
    speed: 250,
    gravity: 1980,
    jump: 745,
    enemyChance: 0.42,
    startGap: [84, 134],
    gap: [118, 195],
    startWidth: [210, 300],
    width: [160, 255],
    startVertical: 32,
    vertical: 74,
    palette: ['#6ea9c7', '#86c4a7', '#e7a947'],
  },
];

const PLATFORM_HEIGHT = 40;
const PLATFORM_ART_HEIGHT = 78;
const LANDING_ZONE = 78;
const START_SAFE_PLATFORMS = 7;

const sprites = {
  hamster: { image: makeImage(hamsterSheet), cols: 4, rows: 1, cell: 192 },
  peanut: { image: makeImage(peanutSheet), cols: 2, rows: 2, cell: 128 },
  enemy: { image: makeImage(enemySheet), cols: 4, rows: 1, cell: 168 },
  platforms: [
    makeImage(platformWoodLong),
    makeImage(platformWoodMedium),
    makeImage(platformWoodShort),
    makeImage(platformDirt),
    makeImage(platformStraw),
    makeImage(platformMushroom),
  ],
  background: [
    makeImage(cloudSprite),
    makeImage(treeSprite),
    makeImage(hillSprite),
    makeImage(barnSprite),
    makeImage(moonSprite),
    makeImage(haySprite),
  ],
  thistle: makeImage(thistleSprite),
  grass: makeImage(grassSprite),
};

const state = {
  mode: 'menu',
  level: levels[0],
  width: 390,
  height: 844,
  dpr: 1,
  time: 0,
  score: 0,
  distance: 0,
  peanuts: 0,
  selectedLevel: 0,
  last: performance.now(),
  speedBoost: 0,
  shake: 0,
  platformCount: 0,
};

const player = {
  x: 74,
  y: 0,
  width: 62,
  height: 54,
  vy: 0,
  jumps: 0,
  grounded: false,
};

let platforms = [];
let peanuts = [];
let enemies = [];
let decor = [];
let backgroundProps = [];

function makeImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

function random(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(min, max, amount) {
  return min + (max - min) * amount;
}

function lerpRange(startRange, endRange, amount) {
  return [lerp(startRange[0], endRange[0], amount), lerp(startRange[1], endRange[1], amount)];
}

function resize() {
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = Math.floor(state.width * state.dpr);
  canvas.height = Math.floor(state.height * state.dpr);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
}

function buildLevelMenu() {
  levelGrid.innerHTML = '';
  levels.forEach((level, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-card';
    button.setAttribute('aria-pressed', String(index === state.selectedLevel));
    button.innerHTML = `
      <span><strong>${level.name}</strong>${level.detail}</span>
      <b>${level.tag}</b>
    `;
    button.addEventListener('click', () => {
      state.selectedLevel = index;
      state.level = levels[index];
      buildLevelMenu();
    });
    levelGrid.append(button);
  });
}

function resetGame() {
  const floor = state.height * 0.7;
  state.level = levels[state.selectedLevel];
  state.mode = 'running';
  state.time = 0;
  state.score = 0;
  state.distance = 0;
  state.peanuts = 0;
  state.speedBoost = 0;
  state.shake = 0;
  state.platformCount = 0;

  player.x = Math.max(58, state.width * 0.18);
  player.y = floor - player.height;
  player.vy = 0;
  player.jumps = 0;
  player.grounded = false;

  platforms = [
    makePlatform(-35, floor, Math.max(340, state.width * 0.82), 0),
    {
      ...makePlatform(Math.max(260, state.width * 0.72), floor - 8, Math.max(260, state.width * 0.62), 1),
      starter: true,
    },
  ];
  state.platformCount = platforms.length;
  peanuts = [];
  enemies = [];
  decor = [];
  backgroundProps = createBackgroundProps();
  while (lastPlatformEnd() < state.width * 1.8) {
    spawnPlatform();
  }

  menu.classList.remove('is-visible');
  gameOver.classList.remove('is-visible');
  updateHud();
}

function lastPlatformEnd() {
  return platforms.reduce((end, platform) => Math.max(end, platform.x + platform.width), 0);
}

function makePlatform(x, y, width, variant = 0) {
  return {
    x,
    y,
    width,
    height: PLATFORM_HEIGHT,
    variant,
  };
}

function currentDifficulty() {
  return clamp((state.distance - 650) / 5200, 0, 1);
}

function createBackgroundProps() {
  const props = [];
  const isNight = state.level.id === 'moon';
  const candidates = isNight ? [0, 1, 4] : state.level.id === 'barn' ? [0, 1, 3, 5] : [0, 1, 2, 5];
  for (let index = 0; index < 16; index += 1) {
    const sprite = candidates[index % candidates.length];
    props.push({
      sprite,
      x: index * random(145, 230) + random(20, 90),
      y: random(state.height * 0.12, state.height * 0.5),
      size: sprite === 0 ? random(88, 142) : random(74, 132),
      speed: sprite === 0 || sprite === 4 ? random(0.08, 0.14) : random(0.16, 0.28),
    });
  }
  return props;
}

function spawnPlatform() {
  const level = state.level;
  const previous = platforms[platforms.length - 1];
  const difficulty = currentDifficulty();
  const gapRange = lerpRange(level.startGap, level.gap, difficulty);
  const widthRange = lerpRange(level.startWidth, level.width, difficulty);
  const maxVertical = lerp(level.startVertical, level.vertical, difficulty);
  const gap = random(gapRange[0], Math.min(gapRange[1], state.width * 0.43));
  const minWidth = Math.max(widthRange[0], LANDING_ZONE * 2 + player.width);
  const maxWidth = Math.min(Math.max(widthRange[1], minWidth + 20), state.width * 0.86);
  const width = random(minWidth, maxWidth);
  const yMin = state.height * 0.47;
  const yMax = state.height * 0.76;
  const rawDelta = random(-maxVertical * 0.72, maxVertical);
  const jumpFriendlyDelta = gap > 155 ? Math.max(rawDelta, -maxVertical * 0.35) : rawDelta;
  const y = previous ? clamp(previous.y + jumpFriendlyDelta, yMin, yMax) : yMax;
  const variant = Math.floor(random(0, sprites.platforms.length));
  const platform = makePlatform((previous ? previous.x + previous.width : 0) + gap, y, width, variant);
  platform.index = state.platformCount;
  state.platformCount += 1;
  platforms.push(platform);

  const peanutCount = Math.random() > 0.22 ? Math.floor(random(1, 4)) : 0;
  const peanutStart = platform.x + Math.max(34, LANDING_ZONE * 0.55);
  const peanutEnd = platform.x + platform.width - 42;
  for (let index = 0; index < peanutCount; index += 1) {
    const x = clamp(peanutStart + index * 42, peanutStart, peanutEnd);
    peanuts.push({
      x,
      y: platform.y - random(68, 104),
      size: 28,
      taken: false,
      bob: random(0, Math.PI * 2),
    });
  }

  const enemyChance = platform.index < START_SAFE_PLATFORMS ? 0 : level.enemyChance * clamp(difficulty + 0.18, 0, 1);
  const freeSpace = platform.width - LANDING_ZONE * 2;
  if (Math.random() < enemyChance && freeSpace > 62) {
    const enemyX = platform.x + LANDING_ZONE + random(0, Math.max(8, freeSpace - 58));
    if (Math.random() < 0.55) {
      enemies.push({
        kind: 'enemy',
        x: enemyX,
        y: platform.y - 42,
        width: 48,
        height: 39,
      });
    } else {
      enemies.push({
        kind: 'thistle',
        x: enemyX,
        y: platform.y - 48,
        width: 44,
        height: 44,
      });
    }
  }

  if (Math.random() > 0.35) {
    decor.push({
      x: platform.x + random(18, Math.max(20, platform.width - 30)),
      y: platform.y - 25,
      size: random(24, 34),
    });
  }
}

function jump() {
  if (state.mode !== 'running') {
    return;
  }
  if (player.jumps >= 2) {
    return;
  }
  player.vy = -state.level.jump * (player.jumps === 0 ? 1 : 0.88);
  player.jumps += 1;
  player.grounded = false;
}

function update(dt) {
  if (state.mode !== 'running') {
    return;
  }

  state.time += dt;
  state.speedBoost += dt * 2.6;
  const speed = state.level.speed + Math.min(82, state.speedBoost);
  const move = speed * dt;
  state.distance += move;
  state.shake = Math.max(0, state.shake - dt * 18);

  player.vy += state.level.gravity * dt;
  const previousBottom = player.y + player.height;
  player.y += player.vy * dt;
  player.grounded = false;

  for (const group of [platforms, peanuts, enemies, decor]) {
    group.forEach((item) => {
      item.x -= move;
    });
  }
  backgroundProps.forEach((item) => {
    item.x -= move * item.speed;
    if (item.x < -item.size - 40) {
      item.x = state.width + random(60, 220);
      item.y = random(state.height * 0.1, state.height * 0.52);
    }
  });

  for (const platform of platforms) {
    const landed =
      player.vy >= 0 &&
      previousBottom <= platform.y + 12 &&
      player.y + player.height >= platform.y &&
      player.x + player.width * 0.78 > platform.x &&
      player.x + player.width * 0.22 < platform.x + platform.width;

    if (landed) {
      player.y = platform.y - player.height;
      player.vy = 0;
      player.grounded = true;
      player.jumps = 0;
    }
  }

  for (const peanut of peanuts) {
    if (!peanut.taken && intersects(playerBox(7), peanutBox(peanut))) {
      peanut.taken = true;
      state.peanuts += 1;
      state.score += 75;
    }
  }

  for (const enemy of enemies) {
    if (intersects(playerBox(9), enemyBox(enemy))) {
      endGame();
    }
  }

  if (player.y > state.height + 90) {
    endGame();
  }

  platforms = platforms.filter((platform) => platform.x + platform.width > -80);
  peanuts = peanuts.filter((peanut) => peanut.x > -80 && !peanut.taken);
  enemies = enemies.filter((enemy) => enemy.x > -90);
  decor = decor.filter((item) => item.x > -80);

  while (lastPlatformEnd() < state.width * 1.85) {
    spawnPlatform();
  }

  state.score = Math.max(state.score, Math.floor(state.distance * 0.18 + state.time * 12 + state.peanuts * 75));
  updateHud();
}

function playerBox(padding = 0) {
  return {
    x: player.x + padding,
    y: player.y + padding,
    width: player.width - padding * 2,
    height: player.height - padding * 2,
  };
}

function peanutBox(peanut) {
  return {
    x: peanut.x,
    y: peanut.y,
    width: peanut.size,
    height: peanut.size,
  };
}

function enemyBox(enemy) {
  return {
    x: enemy.x + 5,
    y: enemy.y + 5,
    width: enemy.width - 10,
    height: enemy.height - 9,
  };
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function endGame() {
  if (state.mode !== 'running') {
    return;
  }
  state.mode = 'over';
  state.shake = 4;
  finalScore.textContent = String(Math.floor(state.score));
  finalPeanuts.textContent = String(state.peanuts);
  finalTime.textContent = `${Math.floor(state.time)}s`;
  gameOver.classList.add('is-visible');
}

function updateHud() {
  scoreEl.textContent = String(Math.floor(state.score));
  peanutsEl.textContent = String(state.peanuts);
  timeEl.textContent = `${Math.floor(state.time)}s`;
}

function draw() {
  const [sky, hill, sun] = state.level.palette;
  ctx.save();
  if (state.shake > 0) {
    ctx.translate(random(-state.shake, state.shake), random(-state.shake, state.shake));
  }

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, state.width, state.height);
  drawBackground(hill, sun);

  decor.forEach((item) => {
    ctx.drawImage(sprites.grass, item.x, item.y, item.size, item.size);
  });

  platforms.forEach(drawPlatform);
  peanuts.forEach(drawPeanut);
  enemies.forEach(drawEnemy);
  drawHamster();

  ctx.restore();
}

function drawBackground(hill, sun) {
  const horizon = state.height * 0.62;
  ctx.fillStyle = 'rgba(255, 248, 223, 0.58)';
  ctx.beginPath();
  ctx.arc(state.width * 0.82, state.height * 0.16, 34, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 4; i += 1) {
    const offset = ((state.distance * (0.05 + i * 0.025)) % state.width) * -1;
    ctx.fillStyle = i % 2 === 0 ? hill : '#5ba775';
    ctx.beginPath();
    ctx.moveTo(offset - state.width, state.height);
    for (let x = offset - state.width; x <= state.width * 2; x += 90) {
      ctx.quadraticCurveTo(x + 45, horizon - i * 32 - 28, x + 90, horizon - i * 18);
    }
    ctx.lineTo(state.width * 2, state.height);
    ctx.closePath();
    ctx.globalAlpha = 0.32 + i * 0.08;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = sun;
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 91 - (state.distance * 0.22) % 91) % (state.width + 120);
    ctx.fillRect(x - 20, state.height - 18, 52, 18);
  }

  backgroundProps.forEach((item) => {
    const image = sprites.background[item.sprite];
    const alpha = item.sprite === 0 || item.sprite === 4 ? 0.86 : 0.72;
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, item.x, item.y, item.size, item.size);
  });
  ctx.globalAlpha = 1;
}

function drawPlatform(platform) {
  const image = sprites.platforms[platform.variant % sprites.platforms.length];
  const visualWidth = platform.width + 26;
  const visualHeight = PLATFORM_ART_HEIGHT;
  ctx.drawImage(image, platform.x - 13, platform.y - 28, visualWidth, visualHeight);

  ctx.fillStyle = 'rgba(87, 52, 25, 0.24)';
  ctx.fillRect(platform.x + 12, platform.y + platform.height - 8, platform.width - 24, 8);
}

function drawPeanut(peanut) {
  const frame = Math.floor(state.time * 8 + peanut.bob) % 4;
  const sx = (frame % sprites.peanut.cols) * sprites.peanut.cell;
  const sy = Math.floor(frame / sprites.peanut.cols) * sprites.peanut.cell;
  const bounce = Math.sin(state.time * 6 + peanut.bob) * 4;
  drawSheetFrame(sprites.peanut, sx, sy, peanut.x, peanut.y + bounce, peanut.size, peanut.size * 1.18);
}

function drawEnemy(enemy) {
  if (enemy.kind === 'thistle') {
    ctx.drawImage(sprites.thistle, enemy.x - 4, enemy.y - 5, enemy.width + 8, enemy.height + 8);
    return;
  }
  const frame = Math.floor(state.time * 9) % 4;
  const sx = frame * sprites.enemy.cell;
  drawSheetFrame(sprites.enemy, sx, 0, enemy.x - 5, enemy.y - 14, enemy.width + 18, enemy.height + 26);
}

function drawHamster() {
  const frame = player.grounded ? Math.floor(state.time * 12) % 4 : player.vy < 0 ? 3 : 1;
  const sx = frame * sprites.hamster.cell;
  const squash = player.grounded ? Math.sin(state.time * 24) * 1.5 : 0;
  drawSheetFrame(
    sprites.hamster,
    sx,
    0,
    player.x - 17,
    player.y - 28 + squash,
    player.width + 34,
    player.height + 38 - squash,
  );
}

function drawSheetFrame(sprite, sx, sy, x, y, width, height) {
  ctx.drawImage(sprite.image, sx, sy, sprite.cell, sprite.cell, x, y, width, height);
}

function loop(now) {
  const dt = Math.min(0.033, (now - state.last) / 1000 || 0);
  state.last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function showMenu() {
  state.mode = 'menu';
  gameOver.classList.remove('is-visible');
  menu.classList.add('is-visible');
}

window.addEventListener('resize', resize);
window.addEventListener('pointerdown', (event) => {
  const isButton = event.target.closest('button');
  if (!isButton) {
    event.preventDefault();
    jump();
  }
});
window.addEventListener(
  'touchmove',
  (event) => {
    event.preventDefault();
  },
  { passive: false },
);
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.code === 'ArrowUp') {
    event.preventDefault();
    jump();
  }
});

startButton.addEventListener('click', resetGame);
retryButton.addEventListener('click', resetGame);
levelsButton.addEventListener('click', showMenu);

resize();
buildLevelMenu();
showMenu();
requestAnimationFrame(loop);
