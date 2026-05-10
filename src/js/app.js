import '../css/main.css';

import hamsterSheet from '../assets/sprites/hamster/sheet-transparent.png';
import peanutSheet from '../assets/sprites/peanut/sheet-transparent.png';
import enemySheet from '../assets/sprites/enemy/sheet-transparent.png';
import groundEnemySheet from '../assets/sprites/enemies/ground/sheet-transparent.png';
import flyingEnemySheet from '../assets/sprites/enemies/flying/sheet-transparent.png';
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

const hud = document.querySelector('.hud');
const gameControls = document.querySelector('.game-controls');
const scoreEl = document.querySelector('#score');
const peanutsEl = document.querySelector('#peanuts');
const timeEl = document.querySelector('#time');
const menu = document.querySelector('#menu');
const home = document.querySelector('#home');
const pauseMenu = document.querySelector('#pauseMenu');
const gameOver = document.querySelector('#gameOver');
const heroPreview = document.querySelector('#heroPreview');
const heroCtx = heroPreview.getContext('2d');
const levelGrid = document.querySelector('#levelGrid');
const newGameButton = document.querySelector('#newGameButton');
const aboutButton = document.querySelector('#aboutButton');
const shareButton = document.querySelector('#shareButton');
const startButton = document.querySelector('#startButton');
const backHomeButton = document.querySelector('#backHomeButton');
const pauseButton = document.querySelector('#pauseButton');
const gameMenuButton = document.querySelector('#gameMenuButton');
const resumeButton = document.querySelector('#resumeButton');
const pauseLevelsButton = document.querySelector('#pauseLevelsButton');
const pauseHomeButton = document.querySelector('#pauseHomeButton');
const retryButton = document.querySelector('#retryButton');
const levelsButton = document.querySelector('#levelsButton');
const finalScore = document.querySelector('#finalScore');
const finalPeanuts = document.querySelector('#finalPeanuts');
const finalTime = document.querySelector('#finalTime');
const finalRecord = document.querySelector('#finalRecord');

const RECORD_KEY = 'hamster-run-records-v1';

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
    startWidth: [260, 360],
    width: [175, 360],
    startVertical: 24,
    vertical: 58,
    platformVariant: 0,
    backgroundSet: 'meadow',
    palette: ['#91d8ea', '#bcebc7', '#f5cb6b'],
  },
  {
    id: 'clover',
    name: 'Tréboles',
    detail: 'Plataformas con hojas y saltos suaves',
    tag: 'Fácil',
    speed: 218,
    gravity: 1810,
    jump: 705,
    enemyChance: 0.24,
    startGap: [74, 118],
    gap: [102, 164],
    startWidth: [250, 350],
    width: [170, 345],
    startVertical: 26,
    vertical: 60,
    platformVariant: 1,
    backgroundSet: 'meadow',
    palette: ['#8fd2e5', '#aee9bd', '#f4d16f'],
  },
  {
    id: 'bridge',
    name: 'Puentes',
    detail: 'Maderos cortos con más atención',
    tag: 'Medio',
    speed: 226,
    gravity: 1850,
    jump: 715,
    enemyChance: 0.28,
    startGap: [76, 122],
    gap: [106, 172],
    startWidth: [235, 325],
    width: [150, 310],
    startVertical: 27,
    vertical: 64,
    platformVariant: 2,
    backgroundSet: 'meadow',
    palette: ['#88cce1', '#9edba8', '#eec86a'],
  },
  {
    id: 'cookie',
    name: 'Galleta',
    detail: 'Suelo blandito y recorrido tranquilo',
    tag: 'Medio',
    speed: 232,
    gravity: 1880,
    jump: 720,
    enemyChance: 0.32,
    startGap: [78, 126],
    gap: [108, 178],
    startWidth: [245, 340],
    width: [165, 335],
    startVertical: 28,
    vertical: 66,
    platformVariant: 3,
    backgroundSet: 'barn',
    palette: ['#7bc6d8', '#edc486', '#d4733e'],
  },
  {
    id: 'straw',
    name: 'Paja',
    detail: 'Granero con enemigos inquietos',
    tag: 'Medio',
    speed: 240,
    gravity: 1930,
    jump: 730,
    enemyChance: 0.36,
    startGap: [82, 130],
    gap: [112, 186],
    startWidth: [240, 330],
    width: [160, 330],
    startVertical: 30,
    vertical: 70,
    platformVariant: 4,
    backgroundSet: 'barn',
    palette: ['#78bfd6', '#e8bd78', '#d06b3d'],
  },
  {
    id: 'moon',
    name: 'Setas',
    detail: 'Noche brillante con vuelos sorpresa',
    tag: 'Difícil',
    speed: 250,
    gravity: 1980,
    jump: 745,
    enemyChance: 0.42,
    startGap: [84, 134],
    gap: [118, 195],
    startWidth: [225, 315],
    width: [145, 300],
    startVertical: 32,
    vertical: 74,
    platformVariant: 5,
    backgroundSet: 'moon',
    palette: ['#6ea9c7', '#86c4a7', '#e7a947'],
  },
];

const PLATFORM_HEIGHT = 40;
const LANDING_ZONE = 78;
const START_SAFE_PLATFORMS = 7;

const platformAssets = [
  { image: makeImage(platformWoodLong), crop: [10, 91, 238, 73], cap: 52, minWidth: 170 },
  { image: makeImage(platformWoodMedium), crop: [31, 90, 194, 76], cap: 46, minWidth: 160 },
  { image: makeImage(platformWoodShort), crop: [54, 95, 148, 66], cap: 38, minWidth: 132 },
  { image: makeImage(platformDirt), crop: [15, 88, 226, 79], cap: 50, minWidth: 170 },
  { image: makeImage(platformStraw), crop: [23, 91, 212, 74], cap: 50, minWidth: 168 },
  { image: makeImage(platformMushroom), crop: [49, 93, 158, 69], cap: 42, minWidth: 138 },
];

const backgroundThemes = {
  meadow: {
    skyTop: '#7fd2ee',
    skyBottom: '#b7edc8',
    farHill: '#7ec98f',
    nearHill: '#4fa96f',
    ground: '#7ab565',
    props: [0, 1, 2],
  },
  barn: {
    skyTop: '#78c6df',
    skyBottom: '#f0cc8c',
    farHill: '#d7b16b',
    nearHill: '#9bbb68',
    ground: '#c7924e',
    props: [0, 3, 5],
  },
  moon: {
    skyTop: '#556fa7',
    skyBottom: '#77b6c9',
    farHill: '#668f8f',
    nearHill: '#5e9b75',
    ground: '#6d9a66',
    props: [4, 0, 1],
  },
};

const backgroundAssets = [
  { image: makeImage(cloudSprite), crop: [27, 64, 202, 128], lane: 'sky' },
  { image: makeImage(treeSprite), crop: [59, 46, 138, 163], lane: 'horizon' },
  { image: makeImage(hillSprite), crop: [20, 83, 215, 90], lane: 'ground' },
  { image: makeImage(barnSprite), crop: [15, 70, 225, 116], lane: 'horizon' },
  { image: makeImage(moonSprite), crop: [57, 63, 142, 130], lane: 'sky' },
  { image: makeImage(haySprite), crop: [30, 57, 195, 141], lane: 'ground' },
];

const sprites = {
  hamster: { image: makeImage(hamsterSheet), cols: 4, rows: 1, cell: 192 },
  peanut: { image: makeImage(peanutSheet), cols: 2, rows: 2, cell: 128 },
  enemy: { image: makeImage(enemySheet), cols: 4, rows: 1, cell: 168 },
  groundEnemy: { image: makeImage(groundEnemySheet), cols: 4, rows: 1, cell: 168 },
  flyingEnemy: { image: makeImage(flyingEnemySheet), cols: 4, rows: 1, cell: 168 },
  platforms: platformAssets,
  background: backgroundAssets,
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
let bursts = [];

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

function readRecords() {
  try {
    const raw = localStorage.getItem(RECORD_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRecord(levelId, score) {
  const records = readRecords();
  const previous = records[levelId] || 0;
  const next = Math.max(previous, Math.floor(score));
  records[levelId] = next;
  localStorage.setItem(RECORD_KEY, JSON.stringify(records));
  return { previous, next, improved: next > previous };
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
  const records = readRecords();
  levelGrid.innerHTML = '';
  levels.forEach((level, index) => {
    const record = records[level.id] || 0;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-card';
    button.setAttribute('aria-pressed', String(index === state.selectedLevel));
    button.innerHTML = `
      <span><strong>${level.name}</strong>${level.detail}<small>Récord: ${record}</small></span>
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
    makePlatform(-35, floor, Math.max(340, state.width * 0.82), state.level.platformVariant),
    {
      ...makePlatform(
        Math.max(260, state.width * 0.72),
        floor - 8,
        Math.max(260, state.width * 0.62),
        state.level.platformVariant,
      ),
      starter: true,
    },
  ];
  state.platformCount = platforms.length;
  peanuts = [];
  enemies = [];
  decor = [];
  bursts = [];
  backgroundProps = createBackgroundProps();
  while (lastPlatformEnd() < state.width * 1.8) {
    spawnPlatform();
  }

  menu.classList.remove('is-visible');
  home.classList.remove('is-visible');
  pauseMenu.classList.remove('is-visible');
  gameOver.classList.remove('is-visible');
  syncGameChrome();
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
  const theme = backgroundThemes[state.level.backgroundSet] || backgroundThemes.meadow;
  const candidates = theme.props;
  for (let index = 0; index < 12; index += 1) {
    const sprite = candidates[index % candidates.length];
    const lane = sprites.background[sprite].lane;
    const spacing = lane === 'sky' ? random(210, 310) : random(240, 360);
    props.push({
      sprite,
      lane,
      x: index * spacing + random(20, 130),
      size: lane === 'sky' ? random(74, 120) : lane === 'horizon' ? random(88, 135) : random(105, 160),
      speed: lane === 'sky' ? random(0.06, 0.12) : lane === 'horizon' ? random(0.16, 0.23) : random(0.25, 0.34),
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
  const maxWidth = Math.min(Math.max(widthRange[1], minWidth + 28), state.width * 0.94);
  const width = random(minWidth, maxWidth);
  const yMin = state.height * 0.47;
  const yMax = state.height * 0.76;
  const rawDelta = random(-maxVertical * 0.72, maxVertical);
  const jumpFriendlyDelta = gap > 155 ? Math.max(rawDelta, -maxVertical * 0.35) : rawDelta;
  const y = previous ? clamp(previous.y + jumpFriendlyDelta, yMin, yMax) : yMax;
  const variant = level.platformVariant;
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
    spawnEnemy(platform, enemyX, difficulty);
  }

  if (Math.random() > 0.35) {
    decor.push({
      x: platform.x + random(18, Math.max(20, platform.width - 30)),
      y: platform.y - 25,
      size: random(24, 34),
    });
  }
}

function spawnEnemy(platform, enemyX, difficulty) {
  const canFly = platform.index > START_SAFE_PLATFORMS + 2 && Math.random() < 0.28 + difficulty * 0.28;
  if (canFly) {
    enemies.push({
      kind: 'flying',
      x: platform.x + platform.width + random(18, 60),
      y: platform.y - random(105, 142),
      baseY: platform.y - random(105, 142),
      width: 46,
      height: 40,
      vx: random(28, 48) + difficulty * 18,
      phase: random(0, Math.PI * 2),
    });
    return;
  }

  const roll = Math.random();
  if (roll < 0.45) {
    enemies.push({
      kind: 'ground',
      x: enemyX,
      y: platform.y - 40,
      width: 48,
      height: 37,
      platformLeft: platform.x + LANDING_ZONE,
      platformRight: platform.x + platform.width - LANDING_ZONE - 48,
      patrolSpeed: random(18, 32) + difficulty * 16,
      direction: Math.random() < 0.5 ? -1 : 1,
      phase: random(0, Math.PI * 2),
    });
  } else if (roll < 0.72) {
    enemies.push({
      kind: 'enemy',
      x: enemyX,
      y: platform.y - 42,
      width: 48,
      height: 39,
      platformLeft: platform.x + LANDING_ZONE,
      platformRight: platform.x + platform.width - LANDING_ZONE - 48,
      patrolSpeed: random(14, 26) + difficulty * 12,
      direction: Math.random() < 0.5 ? -1 : 1,
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

function showHome() {
  state.mode = 'home';
  home.classList.add('is-visible');
  menu.classList.remove('is-visible');
  pauseMenu.classList.remove('is-visible');
  gameOver.classList.remove('is-visible');
  syncGameChrome();
}

function showLevelSelect() {
  state.mode = 'menu';
  buildLevelMenu();
  home.classList.remove('is-visible');
  menu.classList.add('is-visible');
  pauseMenu.classList.remove('is-visible');
  gameOver.classList.remove('is-visible');
  syncGameChrome();
}

function pauseGame() {
  if (state.mode !== 'running') {
    return;
  }
  state.mode = 'paused';
  pauseMenu.classList.add('is-visible');
  syncGameChrome();
}

function resumeGame() {
  if (state.mode !== 'paused') {
    return;
  }
  state.mode = 'running';
  pauseMenu.classList.remove('is-visible');
  syncGameChrome();
}

function syncGameChrome() {
  const inGame = state.mode === 'running' || state.mode === 'paused';
  hud.hidden = !inGame;
  gameControls.hidden = !inGame;
}

async function shareGame() {
  const shareData = {
    title: 'Hamster Run',
    text: 'Juega a Hamster Run y atrapa cacahuetes sin caerte.',
    url: window.location.href,
  };
  if (navigator.share) {
    await navigator.share(shareData);
    return;
  }
  await navigator.clipboard?.writeText(window.location.href);
  shareButton.textContent = 'Enlace copiado';
  window.setTimeout(() => {
    shareButton.textContent = 'Compartir juego';
  }, 1400);
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

  for (const group of [platforms, peanuts, enemies, decor, bursts]) {
    group.forEach((item) => {
      item.x -= move;
      if (item.platformLeft !== undefined) {
        item.platformLeft -= move;
        item.platformRight -= move;
      }
    });
  }
  enemies.forEach((enemy) => {
    if (enemy.kind === 'ground' || enemy.kind === 'enemy') {
      updatePatrolEnemy(enemy, dt);
    } else if (enemy.kind === 'flying') {
      enemy.x -= enemy.vx * dt;
      enemy.y = enemy.baseY + Math.sin(state.time * 4.2 + enemy.phase) * 16;
    }
  });
  backgroundProps.forEach((item) => {
    item.x -= move * item.speed;
    if (item.x < -item.size - 40) {
      item.x = state.width + random(60, 220);
    }
  });
  bursts.forEach((burst) => {
    burst.life -= dt;
    burst.y -= 42 * dt;
    burst.scale += 1.8 * dt;
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
    if (!enemy.defeated && intersects(playerBox(9), enemyBox(enemy))) {
      if (canStomp(enemy, previousBottom)) {
        stompEnemy(enemy);
      } else {
        endGame();
      }
    }
  }

  if (player.y > state.height + 90) {
    endGame();
  }

  platforms = platforms.filter((platform) => platform.x + platform.width > -80);
  peanuts = peanuts.filter((peanut) => peanut.x > -80 && !peanut.taken);
  enemies = enemies.filter((enemy) => enemy.x > -100 && !enemy.defeated);
  decor = decor.filter((item) => item.x > -80);
  bursts = bursts.filter((burst) => burst.life > 0);

  while (lastPlatformEnd() < state.width * 1.85) {
    spawnPlatform();
  }

  state.score = Math.max(state.score, Math.floor(state.distance * 0.18 + state.time * 12 + state.peanuts * 75));
  updateHud();
}

function updatePatrolEnemy(enemy, dt) {
  if (enemy.platformLeft === undefined || enemy.platformRight === undefined || enemy.platformRight <= enemy.platformLeft) {
    return;
  }
  enemy.x += enemy.direction * enemy.patrolSpeed * dt;
  if (enemy.x <= enemy.platformLeft) {
    enemy.x = enemy.platformLeft;
    enemy.direction = 1;
  } else if (enemy.x >= enemy.platformRight) {
    enemy.x = enemy.platformRight;
    enemy.direction = -1;
  }
}

function canStomp(enemy, previousBottom) {
  if (enemy.kind !== 'ground' && enemy.kind !== 'enemy') {
    return false;
  }
  const box = enemyBox(enemy);
  return player.vy > 0 && previousBottom <= box.y + 14 && player.y + player.height <= box.y + box.height * 0.65;
}

function stompEnemy(enemy) {
  enemy.defeated = true;
  player.vy = -state.level.jump * 0.58;
  player.jumps = 1;
  state.score += 130;
  bursts.push({
    x: enemy.x + enemy.width / 2,
    y: enemy.y + enemy.height / 2,
    life: 0.34,
    scale: 0.65,
  });
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
  if (enemy.kind === 'flying') {
    return {
      x: enemy.x + 7,
      y: enemy.y + 7,
      width: enemy.width - 14,
      height: enemy.height - 13,
    };
  }
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
  const record = saveRecord(state.level.id, state.score);
  finalScore.textContent = String(Math.floor(state.score));
  finalPeanuts.textContent = String(state.peanuts);
  finalTime.textContent = `${Math.floor(state.time)}s`;
  finalRecord.textContent = record.improved ? `Nuevo ${record.next}` : String(record.next);
  buildLevelMenu();
  gameOver.classList.add('is-visible');
  syncGameChrome();
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
  bursts.forEach(drawBurst);
  drawHamster();

  ctx.restore();
  drawHeroPreview();
}

function drawBackground(hill, sun) {
  const theme = backgroundThemes[state.level.backgroundSet] || backgroundThemes.meadow;
  const horizon = state.height * 0.62;
  const skyGradient = ctx.createLinearGradient(0, 0, 0, state.height);
  skyGradient.addColorStop(0, theme.skyTop);
  skyGradient.addColorStop(0.62, theme.skyBottom);
  skyGradient.addColorStop(1, theme.ground);
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.fillStyle = 'rgba(255, 248, 223, 0.58)';
  ctx.beginPath();
  ctx.arc(state.width * 0.82, state.height * 0.16, 34, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 3; i += 1) {
    const offset = ((state.distance * (0.05 + i * 0.025)) % state.width) * -1;
    ctx.fillStyle = i === 0 ? theme.farHill : i === 1 ? hill : theme.nearHill;
    ctx.beginPath();
    ctx.moveTo(offset - state.width, state.height);
    for (let x = offset - state.width; x <= state.width * 2; x += 90) {
      ctx.quadraticCurveTo(x + 45, horizon - i * 28 - 26, x + 90, horizon - i * 18);
    }
    ctx.lineTo(state.width * 2, state.height);
    ctx.closePath();
    ctx.globalAlpha = 0.34 + i * 0.1;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = sun;
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 91 - (state.distance * 0.22) % 91) % (state.width + 120);
    ctx.fillRect(x - 20, state.height - 18, 54, 18);
  }

  backgroundProps.forEach((item) => {
    const asset = sprites.background[item.sprite];
    const [sx, sy, sw, sh] = asset.crop;
    const aspect = sh / sw;
    const width = item.size;
    const height = item.size * aspect;
    const y = backgroundLaneY(item.lane, height, horizon, item.x);
    ctx.globalAlpha = item.lane === 'sky' ? 0.86 : 0.76;
    ctx.drawImage(asset.image, sx, sy, sw, sh, item.x, y, width, height);
  });
  ctx.globalAlpha = 1;
}

function backgroundLaneY(lane, height, horizon, x) {
  if (lane === 'sky') {
    return state.height * 0.1 + Math.sin(x * 0.018) * 10;
  }
  if (lane === 'horizon') {
    return horizon - height * 0.86 + 18;
  }
  return horizon - height * 0.28 + 34;
}

function drawPlatform(platform) {
  const asset = sprites.platforms[platform.variant % sprites.platforms.length];
  const [sx, sy, sw, sh] = asset.crop;
  const visualWidth = Math.max(platform.width + 18, asset.minWidth);
  const visualHeight = clamp(asset.minWidth * (sh / sw), 50, 76);
  const x = platform.x - (visualWidth - platform.width) / 2;
  const y = platform.y - 13;
  drawStretchPlatform(asset.image, sx, sy, sw, sh, x, y, visualWidth, visualHeight, asset.cap);
}

function drawStretchPlatform(image, sx, sy, sw, sh, dx, dy, dw, dh, cap) {
  const sourceCap = Math.min(cap, Math.floor(sw * 0.35));
  const destCap = Math.min(Math.round(sourceCap * (dh / sh)), Math.floor(dw * 0.42));
  const sourceCenterWidth = Math.max(1, sw - sourceCap * 2);
  const destCenterWidth = Math.max(1, dw - destCap * 2);

  ctx.drawImage(image, sx, sy, sourceCap, sh, dx, dy, destCap, dh);
  ctx.drawImage(
    image,
    sx + sourceCap,
    sy,
    sourceCenterWidth,
    sh,
    dx + destCap,
    dy,
    destCenterWidth,
    dh,
  );
  drawMirroredSlice(image, sx, sy, sourceCap, sh, dx + destCap + destCenterWidth, dy, destCap, dh);
}

function drawMirroredSlice(image, sx, sy, sw, sh, dx, dy, dw, dh) {
  ctx.save();
  ctx.translate(dx + dw, dy);
  ctx.scale(-1, 1);
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, dw, dh);
  ctx.restore();
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
  if (enemy.kind === 'ground') {
    const frame = Math.floor(state.time * 9 + enemy.phase) % 4;
    const sx = frame * sprites.groundEnemy.cell;
    drawSheetFrame(sprites.groundEnemy, sx, 0, enemy.x - 6, enemy.y - 16, enemy.width + 16, enemy.height + 28);
    return;
  }
  if (enemy.kind === 'flying') {
    const frame = Math.floor(state.time * 11 + enemy.phase) % 4;
    const sx = frame * sprites.flyingEnemy.cell;
    drawSheetFrame(sprites.flyingEnemy, sx, 0, enemy.x - 8, enemy.y - 10, enemy.width + 18, enemy.height + 20);
    return;
  }
  const frame = Math.floor(state.time * 9) % 4;
  const sx = frame * sprites.enemy.cell;
  drawSheetFrame(sprites.enemy, sx, 0, enemy.x - 5, enemy.y - 14, enemy.width + 18, enemy.height + 26);
}

function drawBurst(burst) {
  const progress = 1 - burst.life / 0.34;
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - progress);
  ctx.translate(burst.x, burst.y);
  ctx.scale(burst.scale, burst.scale);
  ctx.fillStyle = '#fff2c8';
  ctx.beginPath();
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8;
    ctx.moveTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
    ctx.lineTo(Math.cos(angle) * 20, Math.sin(angle) * 20);
  }
  ctx.strokeStyle = '#e66b2f';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
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

function drawHeroPreview() {
  if (!home.classList.contains('is-visible')) {
    return;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = heroPreview.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width * dpr));
  const height = Math.max(1, Math.floor(rect.height * dpr));
  if (heroPreview.width !== width || heroPreview.height !== height) {
    heroPreview.width = width;
    heroPreview.height = height;
  }
  heroCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  heroCtx.clearRect(0, 0, rect.width, rect.height);
  const frame = Math.floor(performance.now() / 95) % 4;
  const sx = frame * sprites.hamster.cell;
  heroCtx.drawImage(sprites.hamster.image, sx, 0, sprites.hamster.cell, sprites.hamster.cell, rect.width * 0.18, 8, rect.width * 0.64, rect.height * 0.88);
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
newGameButton.addEventListener('click', showLevelSelect);
backHomeButton.addEventListener('click', showHome);
aboutButton.addEventListener('click', () => {
  window.alert('Hamster Run: salta, haz doble salto, recoge cacahuetes y pisa enemigos de tierra para ganar puntos extra.');
});
shareButton.addEventListener('click', () => {
  shareGame().catch(() => {
    shareButton.textContent = 'No se pudo compartir';
    window.setTimeout(() => {
      shareButton.textContent = 'Compartir juego';
    }, 1400);
  });
});
pauseButton.addEventListener('click', pauseGame);
gameMenuButton.addEventListener('click', showLevelSelect);
resumeButton.addEventListener('click', resumeGame);
pauseLevelsButton.addEventListener('click', showLevelSelect);
pauseHomeButton.addEventListener('click', showHome);
retryButton.addEventListener('click', resetGame);
levelsButton.addEventListener('click', showLevelSelect);

resize();
buildLevelMenu();
showHome();
syncGameChrome();
requestAnimationFrame(loop);
