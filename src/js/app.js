import '../css/main.css';

import hamsterSheet from '../assets/sprites/hamster/sheet-transparent.png';
import blueHamsterSheet from '../assets/sprites/characters/blue-hamster/sheet-transparent.png';
import tasmanianSheet from '../assets/sprites/characters/tasmanian/sheet-transparent.png';
import hamsterAngelSheet from '../assets/sprites/death/hamster-angel/sheet-transparent.png';
import blueHamsterAngelSheet from '../assets/sprites/death/blue-hamster-angel/sheet-transparent.png';
import tasmanianAngelSheet from '../assets/sprites/death/tasmanian-angel/sheet-transparent.png';
import peanutSheet from '../assets/sprites/peanut/sheet-transparent.png';
import heartSheet from '../assets/sprites/heart/sheet-transparent.png';
import enemySheet from '../assets/sprites/enemy/sheet-transparent.png';
import groundEnemySheet from '../assets/sprites/enemies/ground/sheet-transparent.png';
import flyingEnemySheet from '../assets/sprites/enemies/flying/sheet-transparent.png';
import chestnutEnemySheet from '../assets/sprites/enemies/chestnut/sheet-transparent.png';
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
const livesEl = document.querySelector('#lives');
const menu = document.querySelector('#menu');
const home = document.querySelector('#home');
const gameOver = document.querySelector('#gameOver');
const heroPreview = document.querySelector('#heroPreview');
const heroCtx = heroPreview.getContext('2d');
const levelGrid = document.querySelector('#levelGrid');
const characterGrid = document.querySelector('#characterGrid');
const newGameButton = document.querySelector('#newGameButton');
const aboutButton = document.querySelector('#aboutButton');
const shareButton = document.querySelector('#shareButton');
const startButton = document.querySelector('#startButton');
const backHomeButton = document.querySelector('#backHomeButton');
const gameMenuButton = document.querySelector('#gameMenuButton');
const retryButton = document.querySelector('#retryButton');
const levelsButton = document.querySelector('#levelsButton');
const finalScore = document.querySelector('#finalScore');
const finalPeanuts = document.querySelector('#finalPeanuts');
const finalTime = document.querySelector('#finalTime');
const finalRecord = document.querySelector('#finalRecord');
const timeLabelEl = timeEl.previousElementSibling;

const RECORD_KEY = 'hamster-run-records-v1';
const MODE_RECORD_KEY = 'hamster-run-records-v1-by-mode-v1';

const levels = [
  {
    id: 'tutorial',
    name: 'Tutorial',
    detail: 'Aprende',
    tag: 'Inicio',
    speed: 188,
    gravity: 1740,
    jump: 710,
    enemyChance: 0,
    startGap: [58, 90],
    gap: [76, 118],
    startWidth: [280, 380],
    width: [230, 360],
    startVertical: 18,
    vertical: 42,
    lanes: [0.5, 0.61, 0.72],
    movingChance: 0,
    platformVariant: 0,
    backgroundSet: 'meadow',
    palette: ['#91d8ea', '#bcebc7', '#f5cb6b'],
    tutorial: true,
  },
  {
    id: 'meadow',
    name: 'Pradera',
    detail: 'Ritmo suave',
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
    lanes: [0.52, 0.62, 0.72],
    movingChance: 0.08,
    platformVariant: 0,
    backgroundSet: 'meadow',
    palette: ['#91d8ea', '#bcebc7', '#f5cb6b'],
  },
  {
    id: 'clover',
    name: 'Tréboles',
    detail: 'Saltos cómodos',
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
    lanes: [0.5, 0.61, 0.72],
    movingChance: 0.1,
    platformVariant: 1,
    backgroundSet: 'meadow',
    palette: ['#8fd2e5', '#aee9bd', '#f4d16f'],
  },
  {
    id: 'bridge',
    name: 'Puentes',
    detail: 'Más precisión',
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
    lanes: [0.48, 0.6, 0.73],
    movingChance: 0.13,
    platformVariant: 2,
    backgroundSet: 'meadow',
    palette: ['#88cce1', '#9edba8', '#eec86a'],
  },
  {
    id: 'cookie',
    name: 'Galleta',
    detail: 'Ruta estable',
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
    lanes: [0.48, 0.59, 0.72],
    movingChance: 0.14,
    platformVariant: 3,
    backgroundSet: 'barn',
    palette: ['#7bc6d8', '#edc486', '#d4733e'],
  },
  {
    id: 'straw',
    name: 'Paja',
    detail: 'Más enemigos',
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
    lanes: [0.46, 0.58, 0.72],
    movingChance: 0.16,
    platformVariant: 4,
    backgroundSet: 'barn',
    palette: ['#78bfd6', '#e8bd78', '#d06b3d'],
  },
  {
    id: 'moon',
    name: 'Setas',
    detail: 'Saltos exigentes',
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
    lanes: [0.45, 0.57, 0.71],
    movingChance: 0.18,
    platformVariant: 5,
    backgroundSet: 'moon',
    palette: ['#6ea9c7', '#86c4a7', '#e7a947'],
  },
];

const PLATFORM_HEIGHT = 40;
const LANDING_ZONE = 78;
const START_SAFE_PLATFORMS = 7;
const MOVING_PLATFORM_AMPLITUDE = 42;

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
    props: [0, 1],
  },
  barn: {
    skyTop: '#78c6df',
    skyBottom: '#f0cc8c',
    farHill: '#d7b16b',
    nearHill: '#9bbb68',
    ground: '#c7924e',
    props: [0, 3],
  },
  moon: {
    skyTop: '#556fa7',
    skyBottom: '#77b6c9',
    farHill: '#668f8f',
    nearHill: '#5e9b75',
    ground: '#6d9a66',
    props: [4, 0],
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
  blueHamster: { image: makeImage(blueHamsterSheet), cols: 4, rows: 1, cell: 192 },
  tasmanian: { image: makeImage(tasmanianSheet), cols: 4, rows: 1, cell: 192 },
  hamsterAngel: { image: makeImage(hamsterAngelSheet), cols: 4, rows: 1, cell: 192 },
  blueHamsterAngel: { image: makeImage(blueHamsterAngelSheet), cols: 4, rows: 1, cell: 192 },
  tasmanianAngel: { image: makeImage(tasmanianAngelSheet), cols: 4, rows: 1, cell: 192 },
  peanut: { image: makeImage(peanutSheet), cols: 2, rows: 2, cell: 128 },
  heart: { image: makeImage(heartSheet), cols: 2, rows: 2, cell: 128 },
  enemy: { image: makeImage(enemySheet), cols: 4, rows: 1, cell: 168 },
  groundEnemy: { image: makeImage(groundEnemySheet), cols: 4, rows: 1, cell: 168 },
  flyingEnemy: { image: makeImage(flyingEnemySheet), cols: 4, rows: 1, cell: 168 },
  chestnutEnemy: { image: makeImage(chestnutEnemySheet), cols: 4, rows: 1, cell: 168 },
  platforms: platformAssets,
  background: backgroundAssets,
  thistle: makeImage(thistleSprite),
  grass: makeImage(grassSprite),
};

const characters = [
  { id: 'hamster', name: 'Rojo', sprite: sprites.hamster, deathSprite: sprites.hamsterAngel, width: 62, height: 54 },
  { id: 'blueHamster', name: 'Azul', sprite: sprites.blueHamster, deathSprite: sprites.blueHamsterAngel, width: 62, height: 54 },
  { id: 'tasmanian', name: 'Turbo', sprite: sprites.tasmanian, deathSprite: sprites.tasmanianAngel, width: 66, height: 56 },
];

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
  lives: 3,
  invincible: 0,
  selectedLevel: 0,
  selectedCharacter: 0,
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
let hearts = [];
let enemies = [];
let decor = [];
let backgroundProps = [];
let bursts = [];
let modeTimeLeft = null;
let lifeRespawnDelay = 0;
let pendingRespawnPoint = null;

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

function selectedMode() {
  return (
    window.HamsterRunModes?.getSelectedMode?.() || {
      id: 'endless',
      name: 'Endless',
      timeLimit: null,
      difficultyBoost: 0,
      speedBoost: 0,
      enemyBoost: 0,
    }
  );
}

function selectedDifficultyId() {
  return window.HamsterRunModes?.getSelectedDifficultyId?.() || 'medium';
}

function recordKeyForLevel(levelId) {
  const mode = selectedMode();
  return `${mode.id}:${selectedDifficultyId()}:${levelId}`;
}

function recordForLevel(levelId, records = readRecords()) {
  const mode = selectedMode();
  const modeDifficultyKey = recordKeyForLevel(levelId);
  const modeKey = `${mode.id}:${levelId}`;
  const legacy = records[levelId] || 0;

  if (mode.id === 'endless' && selectedDifficultyId() === 'medium') {
    return Math.max(records[modeDifficultyKey] || 0, records[modeKey] || 0, legacy);
  }

  return Math.max(records[modeDifficultyKey] || 0, records[modeKey] || 0);
}

function playSound(name) {
  window.HamsterRunAudio?.play?.(name);
}

function readRecords() {
  try {
    const modeRaw = localStorage.getItem(MODE_RECORD_KEY);
    const legacyRaw = localStorage.getItem(RECORD_KEY);
    return {
      ...(modeRaw ? JSON.parse(modeRaw) : {}),
      ...(legacyRaw ? JSON.parse(legacyRaw) : {}),
    };
  } catch {
    return {};
  }
}

function saveRecord(levelId, score) {
  const records = readRecords();
  const mode = selectedMode();
  const modeDifficultyKey = recordKeyForLevel(levelId);
  const modeKey = `${mode.id}:${levelId}`;
  const previous = recordForLevel(levelId, records);
  const next = Math.max(previous, Math.floor(score));

  records[modeDifficultyKey] = next;
  records[modeKey] = Math.max(records[modeKey] || 0, next);

  if (mode.id === 'endless' && selectedDifficultyId() === 'medium') {
    records[levelId] = next;
    localStorage.setItem(RECORD_KEY, JSON.stringify({ ...JSON.parse(localStorage.getItem(RECORD_KEY) || '{}'), [levelId]: next }));
  }

  localStorage.setItem(MODE_RECORD_KEY, JSON.stringify(records));
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
    const record = recordForLevel(level.id, records);
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

function buildCharacterMenu() {
  characterGrid.innerHTML = '';
  characters.forEach((character, index) => {
    const button = document.createElement('button');
    const preview = document.createElement('canvas');
    const label = document.createElement('span');
    button.type = 'button';
    button.className = 'character-card';
    button.setAttribute('aria-pressed', String(index === state.selectedCharacter));
    label.textContent = character.name;
    button.append(preview, label);
    button.addEventListener('click', () => {
      state.selectedCharacter = index;
      applyCharacter();
      buildCharacterMenu();
    });
    characterGrid.append(button);
    drawCharacterCard(preview, character.sprite);
  });
}

function drawCharacterCard(preview, sprite) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = preview.clientWidth || 96;
  const cssHeight = preview.clientHeight || 58;
  const width = Math.max(1, Math.floor(cssWidth * dpr));
  const height = Math.max(1, Math.floor(cssHeight * dpr));
  preview.width = width;
  preview.height = height;
  const previewCtx = preview.getContext('2d');
  previewCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  previewCtx.clearRect(0, 0, cssWidth, cssHeight);
  previewCtx.drawImage(sprite.image, 0, 0, sprite.cell, sprite.cell, 8, -4, cssWidth - 16, cssHeight + 12);
}

function selectedCharacter() {
  return characters[state.selectedCharacter] || characters[0];
}

function applyCharacter() {
  const character = selectedCharacter();
  player.width = character.width;
  player.height = character.height;
}

function resetGame() {
  const floor = state.height * 0.7;
  const mode = selectedMode();
  applyCharacter();
  state.level = levels[state.selectedLevel];
  state.mode = 'running';
  state.time = 0;
  state.score = 0;
  state.distance = 0;
  state.peanuts = 0;
  state.lives = 3;
  state.invincible = 1.2;
  state.speedBoost = 0;
  state.shake = 0;
  state.platformCount = 0;
  modeTimeLeft = mode.timeLimit ?? null;

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
  hearts = [];
  enemies = [];
  decor = [];
  bursts = [];
  backgroundProps = createBackgroundProps();
  while (lastPlatformEnd() < state.width * 1.8) {
    spawnPlatform(platforms[platforms.length - 1]);
  }

  setActiveOverlay(null);
  syncGameChrome();
  updateHud();
}

function lastPlatformEnd() {
  return platforms.reduce((end, platform) => Math.max(end, platform.x + platform.width), 0);
}

function makePlatform(x, y, width, variant = 0) {
  return {
    id: state.platformCount,
    x,
    y,
    baseY: y,
    width,
    height: PLATFORM_HEIGHT,
    variant,
  };
}

function currentDifficulty() {
  return clamp((state.distance - 650) / 5200 + (selectedMode().difficultyBoost || 0), 0, 1);
}

function laneY(index) {
  const lanes = state.level.lanes || [0.52, 0.64, 0.74];
  const clampedIndex = clamp(index, 0, lanes.length - 1);
  return state.height * lanes[clampedIndex];
}

function closestLaneIndex(y) {
  const lanes = state.level.lanes || [0.52, 0.64, 0.74];
  let bestIndex = 0;
  let bestDistance = Infinity;
  lanes.forEach((lane, index) => {
    const distance = Math.abs(state.height * lane - y);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function choosePlatformY(previous, gap, difficulty) {
  if (!previous) {
    return laneY(2);
  }
  const lanes = state.level.lanes || [0.52, 0.64, 0.74];
  const previousLane = previous.lane ?? closestLaneIndex(previous.baseY ?? previous.y);
  const canStepTwo = difficulty > 0.55 && gap < 136;
  const options = [-1, 0, 1, canStepTwo ? 2 : 0].filter((step) => {
    const nextLane = previousLane + step;
    return nextLane >= 0 && nextLane < lanes.length;
  });
  const easierBias = previousLane === lanes.length - 1 && difficulty < 0.35 ? [-1, 0, 0, 0] : options;
  const step = easierBias[Math.floor(random(0, easierBias.length))];
  const lane = clamp(previousLane + step, 0, lanes.length - 1);
  const wobble = random(-10, 10) * difficulty;
  return laneY(lane) + wobble;
}

function maybeMakePlatformMoving(platform, difficulty) {
  const chance = state.level.movingChance * clamp(difficulty + 0.2, 0, 1);
  if (platform.index < START_SAFE_PLATFORMS + 3 || Math.random() > chance) {
    platform.baseY = platform.y;
    return;
  }
  platform.moving = true;
  platform.baseY = platform.y;
  platform.phase = random(0, Math.PI * 2);
  platform.amplitude = random(18, MOVING_PLATFORM_AMPLITUDE);
  platform.moveSpeed = random(1.1, 1.7);
}

function createBackgroundProps() {
  const props = [];
  const theme = backgroundThemes[state.level.backgroundSet] || backgroundThemes.meadow;
  const candidates = theme.props;
  for (let index = 0; index < 10; index += 1) {
    const sprite = candidates[index % candidates.length];
    const lane = sprites.background[sprite].lane;
    const spacing = lane === 'sky' ? random(230, 340) : random(360, 520);
    props.push({
      sprite,
      lane,
      x: index * spacing + random(20, 130),
      size: lane === 'sky' ? random(74, 120) : random(105, 155),
      speed: lane === 'sky' ? random(0.06, 0.12) : random(0.11, 0.17),
    });
  }
  return props;
}

function spawnPlatform(previous = platforms[platforms.length - 1]) {
  const level = state.level;
  const difficulty = currentDifficulty();
  const tutorialSpec = level.tutorial ? tutorialPlatformSpec(state.platformCount) : null;
  const gapRange = lerpRange(level.startGap, level.gap, difficulty);
  const widthRange = lerpRange(level.startWidth, level.width, difficulty);
  const gap = tutorialSpec?.gap ?? random(gapRange[0], Math.min(gapRange[1], state.width * 0.46));
  const minWidth = Math.max(widthRange[0], LANDING_ZONE * 2 + player.width);
  const maxWidth = Math.min(Math.max(widthRange[1], minWidth + 28), state.width * 0.94);
  const width = tutorialSpec?.width ?? random(minWidth, maxWidth);
  const y = tutorialSpec?.lane !== undefined ? laneY(tutorialSpec.lane) : choosePlatformY(previous, gap, difficulty);
  const variant = level.platformVariant;
  const platform = makePlatform((previous ? previous.x + previous.width : 0) + gap, y, width, variant);
  platform.index = state.platformCount;
  platform.lane = closestLaneIndex(y);
  platform.tutorialPrompt = tutorialSpec?.prompt;
  if (!level.tutorial) {
    maybeMakePlatformMoving(platform, difficulty);
  }
  state.platformCount += 1;
  platforms.push(platform);

  if (level.tutorial && tutorialSpec) {
    spawnTutorialItems(platform, tutorialSpec);
    return;
  }

  const peanutCount = Math.random() > 0.22 ? Math.floor(random(1, 4)) : 0;
  const peanutStart = platform.x + Math.max(34, LANDING_ZONE * 0.55);
  const peanutEnd = platform.x + platform.width - 42;
  for (let index = 0; index < peanutCount; index += 1) {
    const x = clamp(peanutStart + index * 42, peanutStart, peanutEnd);
    const yOffset = random(68, 104);
    peanuts.push({
      x,
      y: platform.y - yOffset,
      size: 28,
      taken: false,
      bob: random(0, Math.PI * 2),
      platformId: platform.id,
      yOffset,
    });
  }

  const heartChance = platform.index > START_SAFE_PLATFORMS && state.lives < 5 ? 0.08 + difficulty * 0.05 : 0.025;
  if (Math.random() < heartChance && platform.width > 190) {
    const yOffset = random(95, 128);
    hearts.push({
      x: platform.x + random(platform.width * 0.35, platform.width * 0.72),
      y: platform.y - yOffset,
      size: 30,
      taken: false,
      bob: random(0, Math.PI * 2),
      platformId: platform.id,
      yOffset,
    });
  }

  const enemyModifier = selectedMode().enemyBoost || 0;
  const enemyChance =
    platform.index < START_SAFE_PLATFORMS
      ? 0
      : (level.enemyChance + enemyModifier) * clamp(difficulty + 0.18, 0, 1);
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
      platformId: platform.id,
      yOffset: 25,
    });
  }
}

function tutorialPlatformSpec(index) {
  const scripted = {
    2: { gap: 64, width: 330, lane: 2, prompt: 'Toca para saltar', peanuts: 2 },
    3: { gap: 132, width: 300, lane: 2, prompt: 'Salta huecos', peanuts: 2 },
    4: { gap: 154, width: 260, lane: 1, prompt: 'Doble salto', heart: true },
    5: { gap: 100, width: 330, lane: 2, prompt: 'Evita enemigos', enemy: 'ground' },
    6: { gap: 116, width: 330, lane: 2, prompt: 'Písalo desde arriba', enemy: 'chestnut', peanuts: 1 },
    7: { gap: 92, width: 340, lane: 1, prompt: 'Sigue corriendo', heart: true, peanuts: 2 },
  };

  if (scripted[index]) {
    return scripted[index];
  }

  return {
    gap: random(88, 124),
    width: random(250, 350),
    lane: Math.floor(random(1, 3)),
    peanuts: Math.random() > 0.48 ? 2 : 0,
  };
}

function spawnTutorialItems(platform, spec) {
  for (let index = 0; index < (spec.peanuts || 0); index += 1) {
    const yOffset = 78;
    peanuts.push({
      x: platform.x + 72 + index * 44,
      y: platform.y - yOffset,
      size: 28,
      taken: false,
      bob: random(0, Math.PI * 2),
      platformId: platform.id,
      yOffset,
    });
  }

  if (spec.heart) {
    const yOffset = 112;
    hearts.push({
      x: platform.x + platform.width * 0.55,
      y: platform.y - yOffset,
      size: 32,
      taken: false,
      bob: random(0, Math.PI * 2),
      platformId: platform.id,
      yOffset,
    });
  }

  if (spec.enemy) {
    addTutorialEnemy(platform, spec.enemy);
  }
}

function addTutorialEnemy(platform, kind) {
  const width = kind === 'chestnut' ? 50 : 48;
  const height = kind === 'chestnut' ? 39 : 37;
  const yOffset = kind === 'chestnut' ? 42 : 40;

  enemies.push({
    kind,
    x: platform.x + platform.width * 0.56,
    y: platform.y - yOffset,
    width,
    height,
    platformLeft: platform.x + LANDING_ZONE,
    platformRight: platform.x + platform.width - LANDING_ZONE - width,
    platformId: platform.id,
    yOffset,
    patrolSpeed: 12,
    direction: -1,
    phase: random(0, Math.PI * 2),
  });
}

function spawnEnemy(platform, enemyX, difficulty) {
  const canFly = platform.index > START_SAFE_PLATFORMS + 2 && Math.random() < 0.28 + difficulty * 0.28;
  if (canFly) {
    const baseY = platform.y - random(112, 154);
    enemies.push({
      kind: 'flying',
      x: platform.x + platform.width + random(18, 60),
      y: baseY,
      baseY,
      width: 68,
      height: 58,
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
      platformId: platform.id,
      yOffset: 40,
      patrolSpeed: random(18, 32) + difficulty * 16,
      direction: Math.random() < 0.5 ? -1 : 1,
      phase: random(0, Math.PI * 2),
    });
  } else if (roll < 0.64) {
    enemies.push({
      kind: 'enemy',
      x: enemyX,
      y: platform.y - 42,
      width: 48,
      height: 39,
      platformLeft: platform.x + LANDING_ZONE,
      platformRight: platform.x + platform.width - LANDING_ZONE - 48,
      platformId: platform.id,
      yOffset: 42,
      patrolSpeed: random(14, 26) + difficulty * 12,
      direction: Math.random() < 0.5 ? -1 : 1,
    });
  } else if (roll < 0.84) {
    enemies.push({
      kind: 'chestnut',
      x: enemyX,
      y: platform.y - 42,
      width: 50,
      height: 39,
      platformLeft: platform.x + LANDING_ZONE,
      platformRight: platform.x + platform.width - LANDING_ZONE - 50,
      platformId: platform.id,
      yOffset: 42,
      patrolSpeed: random(22, 36) + difficulty * 18,
      direction: Math.random() < 0.5 ? -1 : 1,
      phase: random(0, Math.PI * 2),
    });
  } else {
    enemies.push({
      kind: 'thistle',
      x: enemyX,
      y: platform.y - 48,
      width: 44,
      height: 44,
      platformId: platform.id,
      yOffset: 48,
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
  const jumpCountBefore = player.jumps;
  player.vy = -state.level.jump * (player.jumps === 0 ? 1 : 0.88);
  player.jumps += 1;
  player.grounded = false;
  playSound(jumpCountBefore > 0 ? 'doubleJump' : 'jump');
}

function showHome() {
  state.mode = 'home';
  setActiveOverlay(home);
  syncGameChrome();
}

function showLevelSelect() {
  state.mode = 'menu';
  setActiveOverlay(menu);
  buildCharacterMenu();
  buildLevelMenu();
  syncGameChrome();
}

function setActiveOverlay(activeOverlay) {
  [home, menu, gameOver].forEach((overlay) => {
    const isActive = overlay === activeOverlay;
    overlay.hidden = !isActive;
    overlay.classList.toggle('is-visible', isActive);
  });
}

function syncGameChrome() {
  const inGame = state.mode === 'running';
  hud.hidden = !inGame;
  gameControls.hidden = !inGame;
}

async function shareGame() {
  const shareData = {
    title: 'Hamster Run',
    text: 'Corre en Hamster Run y supera tu marca.',
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

function updateModeTimer(dt) {
  if (state.mode !== 'running' || modeTimeLeft === null) {
    return;
  }

  modeTimeLeft = Math.max(0, modeTimeLeft - dt);
  if (modeTimeLeft <= 0) {
    endGame();
  }
}

function update(dt) {
  if (state.mode !== 'running') {
    return;
  }

  if (lifeRespawnDelay > 0) {
    lifeRespawnDelay = Math.max(0, lifeRespawnDelay - dt);
    state.time += dt;
    state.invincible = Math.max(state.invincible, 1.3);
    state.shake = Math.max(0, state.shake - dt * 18);
    updateModeTimer(dt);
    if (lifeRespawnDelay === 0) {
      respawnPlayerAfterLifeLoss();
    }
    updateHud();
    return;
  }

  state.time += dt;
  state.invincible = Math.max(0, state.invincible - dt);
  state.speedBoost += dt * 2.6;
  const speed = state.level.speed + (selectedMode().speedBoost || 0) + Math.min(82, state.speedBoost);
  const move = speed * dt;
  state.distance += move;
  state.shake = Math.max(0, state.shake - dt * 18);
  updateModeTimer(dt);

  player.vy += state.level.gravity * dt;
  const previousBottom = player.y + player.height;
  const wasGrounded = player.grounded;
  player.y += player.vy * dt;
  player.grounded = false;

  for (const group of [platforms, peanuts, hearts, enemies, decor, bursts]) {
    group.forEach((item) => {
      item.x -= move;
      if (item.platformLeft !== undefined) {
        item.platformLeft -= move;
        item.platformRight -= move;
      }
    });
  }
  updateMovingPlatforms(dt, wasGrounded);
  enemies.forEach((enemy) => {
    if (enemy.kind === 'ground' || enemy.kind === 'enemy' || enemy.kind === 'chestnut') {
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
      playSound('peanut');
    }
  }

  for (const heart of hearts) {
    if (!heart.taken && intersects(playerBox(7), itemBox(heart))) {
      heart.taken = true;
      state.lives = Math.min(6, state.lives + 1);
      state.score += 110;
      playSound('heart');
      bursts.push({
        x: heart.x + heart.size / 2,
        y: heart.y + heart.size / 2,
        ttl: 0.38,
        life: 0.38,
        scale: 0.58,
        color: '#ff3f66',
      });
    }
  }

  for (const enemy of enemies) {
    if (!enemy.defeated && intersects(playerBox(9), enemyBox(enemy))) {
      if (canStomp(enemy, previousBottom)) {
        stompEnemy(enemy);
      } else {
        loseLife();
      }
    }
  }

  if (player.y > state.height + 90) {
    loseLife();
  }

  platforms = platforms.filter((platform) => platform.x + platform.width > -80);
  peanuts = peanuts.filter((peanut) => peanut.x > -80 && !peanut.taken);
  hearts = hearts.filter((heart) => heart.x > -80 && !heart.taken);
  enemies = enemies.filter((enemy) => enemy.x > -100 && !enemy.defeated);
  decor = decor.filter((item) => item.x > -80);
  bursts = bursts.filter((burst) => burst.life > 0);

  while (lastPlatformEnd() < state.width * 1.85) {
    spawnPlatform(platforms[platforms.length - 1]);
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

function updateMovingPlatforms(dt, wasGrounded) {
  const platformById = new Map(platforms.map((platform) => [platform.id, platform]));
  platforms.forEach((platform) => {
    if (!platform.moving) {
      return;
    }
    const previousY = platform.y;
    platform.previousY = previousY;
    platform.phase += platform.moveSpeed * dt;
    platform.y = platform.baseY + Math.sin(platform.phase) * platform.amplitude;
    platform.dy = platform.y - previousY;
  });

  for (const item of [...peanuts, ...hearts, ...enemies, ...decor]) {
    if (item.platformId === undefined || item.kind === 'flying') {
      continue;
    }
    const platform = platformById.get(item.platformId);
    if (!platform) {
      continue;
    }
    item.y = platform.y - item.yOffset;
  }

  const standingPlatform = platforms.find((platform) => {
    return (
      wasGrounded &&
      Math.abs(player.y + player.height - (platform.previousY ?? platform.y)) < 6 &&
      player.x + player.width * 0.78 > platform.x &&
      player.x + player.width * 0.22 < platform.x + platform.width
    );
  });
  if (standingPlatform?.moving) {
    player.y += standingPlatform.dy || 0;
  }
}

function canStomp(enemy, previousBottom) {
  if (enemy.kind !== 'ground' && enemy.kind !== 'enemy' && enemy.kind !== 'chestnut') {
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
  playSound('stomp');
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

function itemBox(item) {
  const size = item.size || Math.max(item.width || 0, item.height || 0) || 28;
  return {
    x: item.x,
    y: item.y,
    width: item.width || size,
    height: item.height || size,
  };
}

function enemyBox(enemy) {
  if (enemy.kind === 'flying') {
    return {
      x: enemy.x + 10,
      y: enemy.y + 10,
      width: enemy.width - 20,
      height: enemy.height - 18,
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

function findSafeRespawnPoint() {
  const safePlatform =
    platforms.find((platform) => platform.x <= player.x && platform.x + platform.width >= player.x + player.width) ||
    platforms.find((platform) => platform.x + platform.width > player.x + player.width) ||
    platforms[0];

  if (!safePlatform) {
    return null;
  }

  return {
    x: clamp(player.x, safePlatform.x + 24, safePlatform.x + safePlatform.width - player.width - 24),
    y: safePlatform.y - player.height,
  };
}

function respawnPlayerAfterLifeLoss() {
  const point = pendingRespawnPoint || findSafeRespawnPoint();
  pendingRespawnPoint = null;

  if (!point) {
    endGame();
    return;
  }

  player.x = point.x;
  player.y = point.y;
  player.vy = 0;
  player.jumps = 0;
  player.grounded = true;

  const dangerPadding = 140;
  enemies = enemies.filter((enemy) => {
    const center = enemy.x + enemy.width / 2;
    return center < player.x - dangerPadding || center > player.x + player.width + dangerPadding;
  });
}

function loseLife() {
  if (state.mode !== 'running' || state.invincible > 0 || lifeRespawnDelay > 0) {
    return;
  }

  playSound('damage');
  pendingRespawnPoint = findSafeRespawnPoint();
  state.lives = Math.max(0, state.lives - 1);
  state.invincible = 2.2;
  state.shake = Math.max(state.shake, 2.4);
  bursts.push({
    x: clamp(player.x + player.width / 2, 20, state.width - 20),
    y: clamp(player.y + player.height / 2, 70, state.height - 90),
    ttl: 0.72,
    life: 0.72,
    scale: 0.72,
    color: 'rgba(255, 65, 85, 0.74)',
  });

  if (state.lives <= 0) {
    endGame();
    return;
  }

  lifeRespawnDelay = 0.8;
  player.y = state.height + 180;
  player.vy = 0;
  player.grounded = false;
  updateHud();
}

function endGame() {
  if (state.mode !== 'running') {
    return;
  }
  state.mode = 'over';
  state.shake = 4;
  playSound('gameOver');
  const record = saveRecord(state.level.id, state.score);
  finalScore.textContent = String(Math.floor(state.score));
  finalPeanuts.textContent = String(state.peanuts);
  finalTime.textContent = `${Math.floor(state.time)}s`;
  finalRecord.textContent = record.improved ? `Nuevo ${record.next}` : String(record.next);
  buildLevelMenu();
  setActiveOverlay(gameOver);
  syncGameChrome();
}

function updateHud() {
  const lives = Math.max(0, Math.floor(state.lives));
  scoreEl.textContent = String(Math.floor(state.score));
  peanutsEl.textContent = String(state.peanuts);
  timeEl.textContent =
    modeTimeLeft === null ? `${Math.floor(state.time)}s` : `${Math.max(0, Math.ceil(modeTimeLeft))}s`;
  timeLabelEl.textContent = modeTimeLeft === null ? 'Tiempo' : 'Resta';
  livesEl.textContent = '♥'.repeat(lives);
  livesEl.setAttribute('aria-label', lives === 1 ? '1 vida' : `${lives} vidas`);
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

  if (state.mode === 'running' || state.mode === 'over') {
    decor.forEach((item) => {
      ctx.drawImage(sprites.grass, item.x, item.y, item.size, item.size);
    });

    platforms.forEach(drawPlatform);
    drawTutorialPrompts();
    peanuts.forEach(drawPeanut);
    hearts.forEach(drawHeart);
    enemies.forEach(drawEnemy);
    bursts.forEach(drawBurst);
    drawHamster();
  }

  ctx.restore();
  drawHeroPreview();
}

function drawTutorialPrompts() {
  if (!state.level.tutorial) {
    return;
  }

  platforms.forEach((platform) => {
    if (!platform.tutorialPrompt) {
      return;
    }

    const x = platform.x + platform.width / 2;
    const y = platform.y - 116;
    if (x < -130 || x > state.width + 130) {
      return;
    }

    drawTutorialBubble(platform.tutorialPrompt, x, y);
  });
}

function drawTutorialBubble(text, x, y) {
  ctx.save();
  ctx.font = '900 18px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const width = Math.min(230, Math.max(132, ctx.measureText(text).width + 42));
  const height = 44;
  const left = clamp(x - width / 2, 14, state.width - width - 14);
  const top = clamp(y, 84, state.height - 220);

  ctx.shadowColor = 'rgba(55, 24, 8, 0.24)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 7;
  roundRect(left, top, width, height, 18);
  const gradient = ctx.createLinearGradient(0, top, 0, top + height);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, '#ffe494');
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(95, 51, 20, 0.18)';
  ctx.stroke();

  ctx.fillStyle = '#3a1808';
  ctx.fillText(text, left + width / 2, top + height / 2 + 1);
  ctx.restore();
}

function roundRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
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
    ctx.globalAlpha = item.lane === 'sky' ? 0.82 : 0.42;
    ctx.drawImage(asset.image, sx, sy, sw, sh, item.x, y, width, height);
  });
  ctx.globalAlpha = 1;
}

function backgroundLaneY(lane, height, horizon, x) {
  if (lane === 'sky') {
    return state.height * 0.1 + Math.sin(x * 0.018) * 10;
  }
  if (lane === 'horizon') {
    return horizon - height + 42;
  }
  return state.height - height - 36;
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

function drawHeart(heart) {
  const frame = Math.floor(state.time * 7 + heart.bob) % 4;
  const sx = (frame % sprites.heart.cols) * sprites.heart.cell;
  const sy = Math.floor(frame / sprites.heart.cols) * sprites.heart.cell;
  const bounce = Math.sin(state.time * 5.2 + heart.bob) * 5;
  const pulse = 1 + Math.sin(state.time * 7.5 + heart.bob) * 0.08;
  const size = heart.size * pulse;

  ctx.save();
  ctx.shadowColor = 'rgba(255, 48, 92, 0.55)';
  ctx.shadowBlur = 14;
  drawSheetFrame(
    sprites.heart,
    sx,
    sy,
    heart.x - (size - heart.size) / 2,
    heart.y + bounce - (size - heart.size) / 2,
    size,
    size,
  );
  ctx.restore();
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
  if (enemy.kind === 'chestnut') {
    const frame = Math.floor(state.time * 10 + enemy.phase) % 4;
    const sx = frame * sprites.chestnutEnemy.cell;
    drawSheetFrame(sprites.chestnutEnemy, sx, 0, enemy.x - 7, enemy.y - 16, enemy.width + 18, enemy.height + 28);
    return;
  }
  if (enemy.kind === 'flying') {
    const frame = Math.floor(state.time * 11 + enemy.phase) % 4;
    const sx = frame * sprites.flyingEnemy.cell;
    drawSheetFrame(sprites.flyingEnemy, sx, 0, enemy.x - 12, enemy.y - 15, enemy.width + 24, enemy.height + 30);
    return;
  }
  const frame = Math.floor(state.time * 9) % 4;
  const sx = frame * sprites.enemy.cell;
  drawSheetFrame(sprites.enemy, sx, 0, enemy.x - 5, enemy.y - 14, enemy.width + 18, enemy.height + 26);
}

function drawBurst(burst) {
  const ttl = burst.ttl || 0.38;
  const progress = clamp(1 - burst.life / ttl, 0, 1);
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
  ctx.strokeStyle = burst.color || '#e66b2f';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
}

function drawHamster() {
  const character = selectedCharacter();
  const frame = player.grounded ? Math.floor(state.time * 12) % 4 : player.vy < 0 ? 3 : 1;
  const sx = frame * character.sprite.cell;
  const squash = player.grounded ? Math.sin(state.time * 24) * 1.5 : 0;
  drawSheetFrame(
    character.sprite,
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
  const character = selectedCharacter();
  const frame = Math.floor(performance.now() / 95) % 4;
  const sx = frame * character.sprite.cell;
  const heartFrame = Math.floor(performance.now() / 150) % 4;
  const heartSx = (heartFrame % sprites.heart.cols) * sprites.heart.cell;
  const heartSy = Math.floor(heartFrame / sprites.heart.cols) * sprites.heart.cell;
  const peanutFrame = Math.floor(performance.now() / 130) % 4;
  const peanutSx = (peanutFrame % sprites.peanut.cols) * sprites.peanut.cell;
  const peanutSy = Math.floor(peanutFrame / sprites.peanut.cols) * sprites.peanut.cell;

  heroCtx.save();
  heroCtx.globalAlpha = 0.95;
  heroCtx.drawImage(
    sprites.heart.image,
    heartSx,
    heartSy,
    sprites.heart.cell,
    sprites.heart.cell,
    rect.width * 0.08,
    rect.height * 0.16,
    rect.width * 0.18,
    rect.width * 0.18,
  );
  heroCtx.drawImage(
    sprites.peanut.image,
    peanutSx,
    peanutSy,
    sprites.peanut.cell,
    sprites.peanut.cell,
    rect.width * 0.75,
    rect.height * 0.28,
    rect.width * 0.16,
    rect.width * 0.19,
  );
  heroCtx.restore();
  heroCtx.drawImage(
    character.sprite.image,
    sx,
    0,
    character.sprite.cell,
    character.sprite.cell,
    rect.width * 0.18,
    8,
    rect.width * 0.64,
    rect.height * 0.88,
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
  window.alert('Toca para saltar. Segundo toque: doble salto. Recoge nueces y corazones, evita enemigos.');
});
shareButton.addEventListener('click', () => {
  shareGame().catch(() => {
    shareButton.textContent = 'No se pudo compartir';
    window.setTimeout(() => {
      shareButton.textContent = 'Compartir juego';
    }, 1400);
  });
});
gameMenuButton.addEventListener('click', showLevelSelect);
gameMenuButton.addEventListener('click', () => playSound('pause'), { capture: true });
retryButton.addEventListener('click', resetGame);
levelsButton.addEventListener('click', showLevelSelect);

window.addEventListener('hamster-run-mode-change', () => {
  buildLevelMenu();
  updateHud();
});

resize();
applyCharacter();
buildCharacterMenu();
buildLevelMenu();
showHome();
syncGameChrome();
requestAnimationFrame(loop);
