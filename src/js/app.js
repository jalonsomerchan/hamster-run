import '../css/main.css';
import '../css/arcade-ui.css';
import { TIME_DIFFICULTY_CURVE } from './config/difficultyCurve.js';
import './accessibility.js';
import './sound.js';
import './game-modes.js';

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

import bg1 from '../assets/background/background1.png';
import bg2 from '../assets/background/background2.png';
import bg3 from '../assets/background/background3.png';
import bg4 from '../assets/background/background4.png';

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

const RECORD_KEY = 'hamster-run-records-v1';

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
    background: bg1,
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
    background: bg1,
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
    background: bg2,
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
    background: bg2,
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
    background: bg3,
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
    background: bg3,
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
    background: bg4,
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

const MODE_RECORD_KEY = RECORD_KEY + '-by-mode-v1';
const lifeGhosts = [];
const perfProbe = { enabled: new URLSearchParams(window.location.search).has('debugFps'), frames: 0, acc: 0 };
let lifeGhostCanvas = null;
let lifeGhostCtx = null;
let lifeGhostAnimation = 0;
let lifeGhostLast = 0;
let lifeRespawnDelay = 0;
let pendingRespawnPoint = null;
let currentGameMode = null;
let modeTimeLeft = null;
let seededRandom = null;

let powerUps = [];
const powerUpEffects = { jumps: 0, speed: 0, invincible: 0 };
const feedbacks = [];
const POWER_UP_TYPES = {
  jumps: { id: 'jumps', label: '+saltos', color: '#39a8ff', glow: 'rgba(57, 168, 255, 0.62)', duration: 9, score: 80 },
  speed: { id: 'speed', label: 'turbo', color: '#ff4a4a', glow: 'rgba(255, 74, 74, 0.62)', duration: 7, boost: 132, score: 90 },
  invincible: { id: 'invincible', label: 'invencible', color: '#ffd84a', glow: 'rgba(255, 216, 74, 0.72)', duration: 8, score: 120 },
};

const TUTORIAL_POWER_UPS = {
  8: { gap: 94, width: 340, lane: 2, prompt: 'Azul: más saltos', powerUp: 'jumps' },
  9: { gap: 108, width: 340, lane: 1, prompt: 'Rojo: corres más', powerUp: 'speed', peanuts: 1 },
  10: { gap: 112, width: 340, lane: 2, prompt: 'Amarillo: invencible', powerUp: 'invincible', enemy: 'ground' },
  11: { gap: 102, width: 340, lane: 1, prompt: 'Mira el contador arriba', peanuts: 2 },
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

function makeImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

function random(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(random(min, max + 1));
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
    const selected = index === state.selectedLevel;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'level-card';
    card.dataset.level = String(index);
    card.setAttribute('aria-pressed', String(selected));
    card.setAttribute('aria-current', selected ? 'true' : 'false');
    card.setAttribute('aria-label', `${level.name}. ${level.detail}. ${selected ? 'Seleccionado' : 'Tocar para elegir'}`);
    if (level.background) {
      card.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url(${level.background})`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
    }
    const levelEmojis = { tutorial: '🎓', meadow: '🌿', clover: '🍀', bridge: '🌉', cookie: '🍪', straw: '🌾', moon: '🌑' };
    card.innerHTML = `
      <span>
        <strong>${levelEmojis[level.id] || '🗺️'} ${level.name}</strong>
      </span>
      <small>Récord: ${record}</small>
    `;
    card.addEventListener('click', () => {
      state.selectedLevel = index;
      state.level = levels[index];
      buildLevelMenu();
    });
    levelGrid.append(card);
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

function selectedMode() {
  return currentGameMode || window.HamsterRunModes?.getSelectedMode?.() || { id: 'endless', name: 'Endless', timeLimit: null, seed: null };
}

function resetGame() {
  currentGameMode = window.HamsterRunModes?.getSelectedMode?.() || selectedMode();
  modeTimeLeft = currentGameMode.timeLimit ?? null;
  seededRandom = currentGameMode.seed ? makeSeededRandom(String(currentGameMode.seed) + ':' + state.selectedLevel) : null;
  powerUps.length = 0;
  clearPowerUpEffects();

  const floor = state.height * 0.7;
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

  player.x = Math.max(58, state.width * 0.18);
  player.y = floor - player.height;
  player.vy = 0;
  player.jumps = 0;
  player.grounded = false;

  withModeRandom(() => {
    platforms = [
      makePlatform(-45, floor, Math.max(390, state.width * 0.96), state.level.platformVariant),
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
    backgroundProps = state.level.backgroundSet !== 'none' ? createBackgroundProps() : [];
    while (lastPlatformEnd() < state.width * 1.8) {
      spawnPlatform(platforms[platforms.length - 1]);
    }
  });

  improveStarterPlatforms();
  setActiveOverlay(null);
  syncGameChrome();
  updateHud();
}

function improveStarterPlatforms() {
  if (platforms.length < 2) return;

  const floor = state.height * 0.7;
  const first = platforms[0];
  const second = platforms[1];
  const oldSecondEnd = second.x + second.width;

  first.x = -45;
  first.y = floor;
  first.baseY = floor;
  first.width = clamp(state.width * 0.86, 330, 420);
  first.lane = closestLaneIndex(first.y);
  first.starter = true;

  const transitionGap = clamp(state.width * 0.16, 62, 92);
  const transitionWidth = clamp(state.width * 0.46, 176, 238);
  const transitionLift = clamp(state.height * 0.055, 34, 54);

  second.x = first.x + first.width + transitionGap;
  second.y = floor - transitionLift;
  second.baseY = second.y;
  second.width = transitionWidth;
  second.lane = closestLaneIndex(second.y);
  second.starter = true;

  const delta = second.x + second.width - oldSecondEnd;
  if (Math.abs(delta) < 0.5) return;

  for (let index = 2; index < platforms.length; index += 1) {
    platforms[index].x += delta;
  }

  shiftStarterSpawnedItems(peanuts, delta);
  shiftStarterSpawnedItems(hearts, delta);
  shiftStarterSpawnedItems(powerUps, delta);
  shiftStarterSpawnedItems(enemies, delta);
  shiftStarterSpawnedItems(decor, delta);
}

function shiftStarterSpawnedItems(items, delta) {
  for (const item of items) {
    if ((item.platformId ?? 0) >= 2) item.x += delta;
    if ((item.platformLeft ?? 0) > 0) item.platformLeft += delta;
    if ((item.platformRight ?? 0) > 0) item.platformRight += delta;
  }
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
  const base = clamp((state.distance - 450) / 3400, 0, 2.2) + timeDifficultyRamp().difficulty;
  return clamp(base + (selectedMode().difficultyBoost || 0), 0, 1);
}

function timeDifficultyRamp(seconds = state.time || 0) {
  const curve = TIME_DIFFICULTY_CURVE;
  const earlySeconds = Math.min(seconds, curve.fastRampStartSeconds);
  const lateSeconds = Math.max(0, seconds - curve.fastRampStartSeconds);

  return {
    difficulty: clamp(
      earlySeconds * curve.earlyDifficultyPerSecond + lateSeconds * curve.lateDifficultyPerSecond,
      0,
      curve.maxDifficultyBonus,
    ),
    speed: clamp(
      earlySeconds * curve.earlySpeedPerSecond + lateSeconds * curve.lateSpeedPerSecond,
      0,
      curve.maxSpeedBonus,
    ),
    enemies: clamp(
      earlySeconds * curve.earlyEnemyPerSecond + lateSeconds * curve.lateEnemyPerSecond,
      0,
      curve.maxEnemyBonus,
    ),
    gap: clamp(
      earlySeconds * curve.earlyGapPerSecond + lateSeconds * curve.lateGapPerSecond,
      0,
      curve.maxGapBonus,
    ),
    platformShrink: clamp(
      earlySeconds * curve.earlyPlatformShrinkPerSecond + lateSeconds * curve.latePlatformShrinkPerSecond,
      0,
      curve.maxPlatformShrink,
    ),
    vertical: clamp(
      earlySeconds * curve.earlyVerticalPerSecond + lateSeconds * curve.lateVerticalPerSecond,
      0,
      curve.maxVerticalBonus,
    ),
  };
}

function withModeRandom(callback) {
  if (!seededRandom) return callback();
  const nativeRandom = Math.random;
  Math.random = seededRandom;
  try {
    return callback();
  } finally {
    Math.random = nativeRandom;
  }
}

function makeSeededRandom(seedText) {
  let seed = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    seed ^= seedText.charCodeAt(index);
    seed = Math.imul(seed, 16777619);
  }
  return function randomFromSeed() {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
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

function spawnBackgroundProp(initial = false) {
  const theme = backgroundThemes[state.level.backgroundSet] || backgroundThemes.meadow;
  if (!theme.props.length) return;
  const sprite = theme.props[Math.floor(random(0, theme.props.length))];
  const lane = sprites.background[sprite].lane;
  const x = initial ? random(0, state.width) : state.width + random(50, 150);
  backgroundProps.push({
    sprite,
    lane,
    x,
    size: lane === 'sky' ? random(74, 120) : random(105, 155),
    speed: lane === 'sky' ? random(0.06, 0.12) : random(0.11, 0.17),
  });
}

function spawnPlatform(previous = platforms[platforms.length - 1]) {
  const level = state.level;
  const difficulty = currentDifficulty();
  const tutorialSpec = level.tutorial ? tutorialPlatformSpec(state.platformCount) : null;
  const ramp = timeDifficultyRamp();
  const pressure = highDifficultyPressure();
  const gapRange = lerpRange(level.startGap, level.gap, difficulty);
  const widthRange = lerpRange(level.startWidth, level.width, difficulty);

  const rawGap = random(gapRange[0] + ramp.gap * 0.32 + pressure.gap * 0.34, Math.min(gapRange[1] + ramp.gap + pressure.gap, state.width * 0.54));
  const gap = tutorialSpec?.gap ?? clampReachableGap(rawGap, previous, difficulty);

  const minWidth = Math.max(widthRange[0] - ramp.platformShrink - pressure.platformShrink, LANDING_ZONE * 1.35 + player.width);
  const maxWidth = Math.min(Math.max(widthRange[1] - ramp.platformShrink - pressure.platformShrink, minWidth + 34), state.width * 0.94);
  const width = tutorialSpec?.width ?? random(minWidth, maxWidth);

  const y = tutorialSpec?.lane !== undefined ? laneY(tutorialSpec.lane) : chooseReachablePlatformY(previous, gap, difficulty + (ramp.vertical + pressure.vertical) / 170);
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
    if (tutorialSpec?.powerUp) spawnPowerUp(platform, tutorialSpec.powerUp, 0.56);
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

  maybeSpawnPowerUp(platform);

  const enemyChance = platform.index < enemySafePlatformCount() ? 0 : enemySpawnChance(level.enemyChance * clamp(difficulty + 0.18, 0, 2.2));
  const freeSpace = platform.width - LANDING_ZONE * 2;
  if (enemyChance > 0 && freeSpace > 62) {
    const enemyCount = enemySpawnCount(enemyChance, freeSpace);
    for (let enemyIndex = 0; enemyIndex < enemyCount; enemyIndex += 1) {
      const laneRatio = (enemyIndex + 1) / (enemyCount + 1);
      const jitter = random(-14, 14);
      const enemyX = platform.x + LANDING_ZONE + clamp(freeSpace * laneRatio + jitter, 0, Math.max(8, freeSpace - 58));
      spawnEnemy(platform, enemyX, difficulty + enemyIndex * 0.12);
    }
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

  if (state.level.backgroundSet !== 'none' && platform.index % 3 === 0) {
    spawnBackgroundProp();
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

  return TUTORIAL_POWER_UPS[index] || scripted[index] || {
    gap: random(88, 124),
    width: random(250, 350),
    lane: Math.floor(random(1, 3)),
    peanuts: Math.random() > 0.48 ? 2 : 0,
  };
}

function highDifficultyPressure() {
  const mode = selectedMode();
  const boost = Math.max(0, mode?.difficultyBoost || 0);
  const speedBoost = Math.max(0, mode?.speedBoost || 0);
  const enemyBoost = Math.max(0, mode?.enemyBoost || 0);

  return {
    gap: boost * 62 + speedBoost * 0.24,
    platformShrink: boost * 42 + speedBoost * 0.16,
    vertical: boost * 48 + enemyBoost * 34,
  };
}

function maxReachableDoubleJumpGap(previous, difficulty = 0) {
  const level = state.level || {};
  const gravity = Math.max(1, level.gravity || 1800);
  const jumpSpeed = Math.max(1, level.jump || 700);
  const speed = Math.max(1, (level.speed || 220) + timeDifficultyRamp().speed + selectedModeSpeedBoost() + (state.speedBoost || 0));
  const jumpWindow = clamp((jumpSpeed / gravity) * 2.05, 0.72, 1.08);
  const verticalPenalty = previous ? Math.abs((previous.baseY ?? previous.y) - laneY(closestLaneIndex(previous.baseY ?? previous.y))) * 0.18 : 0;
  const pressurePenalty = clamp(difficulty, 0, 2.4) * 10;
  return clamp(speed * jumpWindow - verticalPenalty - pressurePenalty, state.width * 0.32, state.width * 0.52);
}

function clampReachableGap(rawGap, previous, difficulty = 0) {
  return Math.min(rawGap, maxReachableDoubleJumpGap(previous, difficulty));
}

function chooseReachablePlatformY(previous, gap, difficulty) {
  const y = choosePlatformY(previous, gap, difficulty);
  if (!previous) return y;

  const previousY = previous.baseY ?? previous.y;
  const maxDelta = clamp(92 - gap * 0.12, 44, 86);
  return clamp(y, previousY - maxDelta, previousY + maxDelta);
}

function selectedModeSpeedBoost() {
  return Math.max(0, selectedMode()?.speedBoost || 0);
}

function enemyModeSettings() {
  const mode = selectedMode();
  const modeId = mode?.id || 'endless';
  return {
    modeId,
    disabled: modeId === 'peaceful',
    multiplier: modeId === 'horde' ? Math.max(2.8, mode?.enemySpawnMultiplier || 1) : 1,
    boost: Math.max(0, mode?.enemyBoost || 0),
  };
}

function enemySafePlatformCount() {
  return enemyModeSettings().modeId === 'horde' ? 3 : START_SAFE_PLATFORMS;
}

function enemySpawnChance(baseChance) {
  const settings = enemyModeSettings();
  if (settings.disabled) return 0;
  if (settings.modeId === 'horde') return clamp(0.78 + baseChance * 0.18 + settings.boost * 0.04, 0, 0.96);
  return clamp(baseChance + settings.boost * 0.04 + timeDifficultyRamp().enemies, 0, 0.72);
}

function enemySpawnCount(chance, freeSpace) {
  const settings = enemyModeSettings();
  if (Math.random() > chance) return 0;
  const maxBySpace = Math.max(1, Math.floor(freeSpace / 92));
  if (settings.modeId !== 'horde') return 1;

  let count = Math.min(2, maxBySpace);
  if (maxBySpace > 2 && Math.random() < 0.46) count += 1;
  if (maxBySpace > 3 && Math.random() < 0.18) count += 1;
  return Math.min(count, maxBySpace, 4);
}

function maybeSpawnPowerUp(platform) {
  if (!platform || state.level?.tutorial || platform.index <= START_SAFE_PLATFORMS + 1 || platform.width < 210) return;
  const difficulty = currentDifficulty();
  const chance = 0.075 + difficulty * 0.055;
  if (Math.random() > chance) return;
  const types = ['jumps', 'speed', 'invincible'];
  spawnPowerUp(platform, types[Math.floor(random(0, types.length))], random(0.34, 0.72));
}

function spawnPowerUp(platform, type, ratio = 0.5) {
  const def = POWER_UP_TYPES[type];
  if (!platform || !def) return;
  const size = 34;
  const x = clamp(platform.x + platform.width * ratio, platform.x + 46, platform.x + platform.width - 46);
  const yOffset = 92;
  powerUps.push({ type, x, y: platform.y - yOffset, size, taken: false, bob: random(0, Math.PI * 2), platformId: platform.id, yOffset, pulse: 0 });
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
  if (state.mode !== 'running' || lifeRespawnDelay > 0) return;

  const jumpsBefore = player.jumps;
  const maxJumps = powerUpEffects.jumps > 0 ? 4 : 2;

  if (player.jumps < maxJumps) {
    player.vy = -state.level.jump * (player.jumps === 0 ? 1 : 0.88);
    player.jumps += 1;
    player.grounded = false;
    playSound(jumpsBefore > 0 ? 'doubleJump' : 'jump');
  }
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

function update(dt) {
  if (state.mode !== 'running' && state.mode !== 'paused') return;

  if (state.mode === 'paused') {
    state.last = performance.now();
    return;
  }

  if (lifeRespawnDelay > 0) {
    lifeRespawnDelay -= dt;
    if (lifeRespawnDelay <= 0) respawnPlayerAfterLifeLoss();
  }

  state.time += dt;
  if (modeTimeLeft !== null) {
    modeTimeLeft = Math.max(0, modeTimeLeft - dt);
    if (modeTimeLeft <= 0) endGame();
  }

  updatePowerUpEffects(dt);
  state.invincible = Math.max(0, state.invincible - dt);
  state.speedBoost += dt * 2.6;
  const ramp = timeDifficultyRamp();
  const speed = (state.level.speed + ramp.speed + selectedModeSpeedBoost() + Math.min(82, state.speedBoost)) * (powerUpEffects.speed > 0 ? 1.45 : 1);
  const move = speed * dt;
  state.distance += move;
  state.shake = Math.max(0, state.shake - dt * 18);

  if (lifeRespawnDelay <= 0) {
    player.vy += state.level.gravity * dt;
    const previousBottom = player.y + player.height;
    const wasGrounded = player.grounded;
    player.y += player.vy * dt;
    player.grounded = false;

    for (const platform of platforms) {
      const landed = player.vy >= 0 && previousBottom <= platform.y + 12 && player.y + player.height >= platform.y && player.x + player.width * 0.78 > platform.x && player.x + player.width * 0.22 < platform.x + platform.width;
      if (landed) { player.y = platform.y - player.height; player.vy = 0; player.grounded = true; player.jumps = 0; }
    }
  }

  for (const group of [platforms, peanuts, hearts, enemies, decor, bursts, powerUps]) {
    group.forEach((item) => {
      item.x -= move;
      if (item.platformLeft !== undefined) { item.platformLeft -= move; item.platformRight -= move; }
    });
  }

  updateMovingPlatforms(dt, player.grounded);
  updateEntities(dt);

  backgroundProps.forEach((item) => {
    item.x -= move * item.speed;
    if (item.x < -item.size - 40) item.x = state.width + random(60, 220);
  });

  checkCollisions();

  if (player.y > state.height + 90) loseLife();

  feedbacks.forEach((f, i) => {
    f.age += dt;
    f.y -= 42 * dt;
    if (f.age > f.ttl) feedbacks.splice(i, 1);
  });

  pruneEntities();

  while (lastPlatformEnd() < state.width * 1.85) {
    withModeRandom(() => spawnPlatform(platforms[platforms.length - 1]));
  }

  state.score = Math.max(state.score, Math.floor(state.distance * 0.18 + state.time * 12 + state.peanuts * 75));
  updateHud();
}

function updatePowerUpEffects(dt) {
  powerUpEffects.jumps = Math.max(0, powerUpEffects.jumps - dt);
  powerUpEffects.speed = Math.max(0, powerUpEffects.speed - dt);
  powerUpEffects.invincible = Math.max(0, powerUpEffects.invincible - dt);
  if (powerUpEffects.invincible > 0) state.invincible = Math.max(state.invincible, 0.5);
}

function updateEntities(dt) {
  enemies.forEach((enemy) => {
    if (enemy.kind === 'ground' || enemy.kind === 'enemy' || enemy.kind === 'chestnut') updatePatrolEnemy(enemy, dt);
    else if (enemy.kind === 'flying') { enemy.x -= (enemy.vx || 65) * dt; enemy.y = enemy.baseY + Math.sin(state.time * 4.2 + enemy.phase) * 16; }
  });
  bursts.forEach((burst) => { burst.life -= dt; burst.y -= 42 * dt; if (burst.scale !== undefined) burst.scale += 1.8 * dt; });
  powerUps.forEach((p) => { p.pulse += dt * 6; });
}

function checkCollisions() {
  const previousBottom = player.y + player.height - player.vy * (1 / 60);

  for (const peanut of peanuts) {
    const dx = player.x + player.width / 2 - (peanut.x + peanut.size / 2);
    const dy = player.y + player.height / 2 - (peanut.y + peanut.size / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (!peanut.taken && distance < (player.width + peanut.size) * 0.42) {
      peanut.taken = true;
      state.peanuts += 1;
      state.score += 75;
      addFeedback('+75', peanut.x + peanut.size / 2, peanut.y - 12, '#f5cb6b');
      playSound('peanut');
      bursts.push({ x: peanut.x + peanut.size / 2, y: peanut.y + peanut.size / 2, ttl: 0.32, life: 0.32, radius: 24, color: '#f5cb6b' });
    }
  }

  for (const heart of hearts) {
    if (!heart.taken && intersects(playerBox(7), itemBox(heart))) {
      heart.taken = true;
      state.lives = Math.min(6, state.lives + 1);
      state.score += 110;
      addFeedback('VIDA!', heart.x + heart.size / 2, heart.y - 12, '#ff3f66');
      playSound('heart');
      bursts.push({ x: heart.x + heart.size / 2, y: heart.y + heart.size / 2, ttl: 0.38, life: 0.38, scale: 0.58, color: '#ff3f66' });
    }
  }

  for (const p of powerUps) {
    const dx = player.x + player.width / 2 - (p.x + p.size / 2);
    const dy = player.y + player.height / 2 - (p.y + p.size / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (!p.taken && distance < (player.width + p.size) * 0.42) {
      p.taken = true;
      const def = POWER_UP_TYPES[p.type];
      powerUpEffects[p.type] = def.duration;
      state.score += def.score;
      addFeedback(def.label, player.x + player.width / 2, player.y - 12, def.color);
      playSound('powerup');
      bursts.push({ x: p.x + p.size / 2, y: p.y + p.size / 2, ttl: 0.46, life: 0.46, radius: 28, color: def.color });
    }
  }

  for (const enemy of enemies) {
    if (!enemy.defeated && intersects(playerBox(9), enemyBox(enemy))) {
      if (canStomp(enemy, previousBottom)) stompEnemy(enemy);
      else if (powerUpEffects.invincible <= 0) loseLife();
    }
  }
}

function addFeedback(text, x, y, color) {
  feedbacks.push({ text, x, y, age: 0, ttl: 1.2, color });
}

function drawFeedbackItem(f) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - f.age / f.ttl);
  ctx.fillStyle = f.color;
  ctx.font = '900 16px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(f.text, f.x, f.y);
  ctx.restore();
}

function pruneEntities() {
  const limit = -120;
  platforms = platforms.filter((p) => p.x + p.width > limit);
  peanuts = peanuts.filter((p) => p.x > limit && !p.taken);
  hearts = hearts.filter((p) => p.x > limit && !p.taken);
  powerUps = powerUps.filter((p) => p.x > limit && !p.taken);
  enemies = enemies.filter((e) => e.x > limit - 40 && !e.defeated);
  decor = decor.filter((d) => d.x > limit);
  bursts = bursts.filter((b) => b.life > 0);
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
  if (!enemy || enemy.kind === 'thistle') return false;
  const box = enemyBox(enemy);
  const playerHitbox = playerBox(8);
  const playerBottom = player.y + player.height;
  const horizontalOverlap = Math.min(playerHitbox.x + playerHitbox.width, box.x + box.width) - Math.max(playerHitbox.x, box.x);
  const minRequiredOverlap = Math.min(playerHitbox.width, box.width) * 0.18;
  return horizontalOverlap >= minRequiredOverlap && previousBottom <= box.y + Math.max(18, box.height * 0.48) && playerBottom <= box.y + box.height * 0.78 && player.vy >= -120;
}

function loseLife() {
  if (state.mode !== 'running' || state.invincible > 0 || lifeRespawnDelay > 0) return;
  playSound('damage');
  pendingRespawnPoint = findSafeRespawnPoint();
  spawnLifeGhost();
  state.lives = Math.max(0, state.lives - 1);
  state.invincible = 2.9;
  state.shake = Math.max(state.shake, 2.2);
  updateHud();
  bursts.push({ x: clamp(player.x + player.width / 2, 20, state.width - 20), y: clamp(player.y + player.height / 2, 70, state.height - 90), ttl: 0.72, life: 0.72, radius: 28, color: 'rgba(255, 65, 85, 0.74)' });
  if (state.lives <= 0) { endGame(); return; }
  lifeRespawnDelay = 0.95;
  player.y = state.height + 520;
  player.vy = 0;
  player.grounded = false;
}

function findSafeRespawnPoint() {
  const safePlatform = platforms.find((platform) => platform.x <= player.x && platform.x + platform.width >= player.x + player.width) || platforms.find((platform) => platform.x + platform.width > player.x + player.width) || platforms[0];
  if (!safePlatform) return null;
  return { x: clamp(player.x, safePlatform.x + 30, safePlatform.x + safePlatform.width - player.width - 30), y: safePlatform.y - player.height - 18 };
}

function spawnLifeGhost() {
  ensureLifeGhostLayer();
  const character = selectedCharacter();
  const sprite = character.deathSprite || character.sprite;
  const ghostWidth = player.width + 48;
  const ghostHeight = player.height + 78;
  lifeGhosts.push({ x: clamp(player.x - 24, 16, state.width - ghostWidth - 16), y: clamp(player.y - 54, 68, state.height - ghostHeight - 96), width: ghostWidth, height: ghostHeight, sprite, frame: Math.floor(state.time * 10) % sprite.cols, age: 0, ttl: 2.1, drift: Math.random() < 0.5 ? -12 : 12 });
  if (lifeGhosts.length > 5) lifeGhosts.splice(0, lifeGhosts.length - 5);
  startLifeGhostAnimation();
}

function ensureLifeGhostLayer() {
  if (!lifeGhostCanvas) {
    lifeGhostCanvas = document.createElement('canvas');
    lifeGhostCanvas.id = 'lifeGhostLayer';
    Object.assign(lifeGhostCanvas.style, { position: 'fixed', inset: '0', width: '100vw', height: '100dvh', pointerEvents: 'none', zIndex: '12' });
    document.body.append(lifeGhostCanvas);
    lifeGhostCtx = lifeGhostCanvas.getContext('2d');
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.floor(window.innerWidth * dpr);
  const height = Math.floor(window.innerHeight * dpr);
  if (lifeGhostCanvas.width !== width || lifeGhostCanvas.height !== height) { lifeGhostCanvas.width = width; lifeGhostCanvas.height = height; }
  lifeGhostCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function startLifeGhostAnimation() {
  if (lifeGhostAnimation) return;
  lifeGhostLast = performance.now();
  lifeGhostAnimation = requestAnimationFrame(tickLifeGhosts);
}

function tickLifeGhosts(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lifeGhostLast) / 1000));
  lifeGhostLast = now;
  ensureLifeGhostLayer();
  lifeGhostCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (let index = lifeGhosts.length - 1; index >= 0; index -= 1) {
    const ghost = lifeGhosts[index];
    ghost.age += dt;
    ghost.y -= 88 * dt;
    ghost.x += ghost.drift * dt;
    drawLifeGhost(ghost);
    if (ghost.age >= ghost.ttl) lifeGhosts.splice(index, 1);
  }
  if (lifeGhosts.length) { lifeGhostAnimation = requestAnimationFrame(tickLifeGhosts); return; }
  lifeGhostAnimation = 0;
  lifeGhostCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawLifeGhost(ghost) {
  const progress = clamp(ghost.age / ghost.ttl, 0, 1);
  const sprite = ghost.sprite;
  const cell = sprite.cell;
  lifeGhostCtx.save();
  lifeGhostCtx.globalAlpha = Math.max(0, 0.86 * (1 - progress));
  lifeGhostCtx.translate(ghost.x + ghost.width / 2, ghost.y + ghost.height / 2 - Math.sin(progress * Math.PI) * 14);
  lifeGhostCtx.scale(1 + progress * 0.2, 1 + progress * 0.2);
  lifeGhostCtx.filter = 'brightness(1.08) saturate(0.96)';
  lifeGhostCtx.drawImage(sprite.image, ghost.frame * cell, 0, cell, cell, -ghost.width / 2, -ghost.height / 2, ghost.width, ghost.height);
  lifeGhostCtx.filter = 'none';
  lifeGhostCtx.restore();
}

function respawnPlayerAfterLifeLoss() {
  const point = pendingRespawnPoint || findSafeRespawnPoint();
  pendingRespawnPoint = null;
  if (!point) { endGame(); return; }
  player.x = point.x;
  player.y = point.y;
  player.vy = 0;
  player.jumps = 0;
  player.grounded = true;
  const dangerPadding = 155;
  enemies = enemies.filter((enemy) => {
    const enemyCenter = enemy.x + enemy.width / 2;
    return enemyCenter < player.x - dangerPadding || enemyCenter > player.x + player.width + dangerPadding;
  });
  bursts.push({ x: player.x + player.width / 2, y: player.y + player.height / 2, ttl: 0.95, life: 0.95, radius: 18, color: 'rgba(255, 91, 91, 0.54)' });
}

function stompEnemy(enemy) {
  if (!enemy || enemy.defeated) return;
  playSound('stomp');
  enemy.defeated = true;
  enemy.defeatTime = 0.28;
  state.score += enemy.kind === 'flying' ? 180 : 140;
  player.vy = -state.level.jump * 0.46;
  player.jumps = 1;
  player.grounded = false;
  bursts.push({ x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2, ttl: 0.34, life: 0.34, radius: Math.max(enemy.width, enemy.height) * 0.55, color: 'rgba(255, 232, 120, 0.65)' });
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

function endGame() {
  if (state.mode !== 'running') return;
  playSound('gameOver');
  state.mode = 'over';
  state.shake = 4;
  const record = saveRecord(state.level.id, state.score);
  const rank = state.score > 20000 ? 'HAMSTER DIVINO' : state.score > 10000 ? 'MAESTRO CORREDOR' : state.score > 5000 ? 'PRO HAMSTER' : 'NOVATO';
  
  finalScore.textContent = Math.floor(state.score);
  finalScore.dataset.rank = rank;
  
  finalPeanuts.textContent = String(state.peanuts);
  finalTime.textContent = `${Math.floor(state.time)}s`;
  
  if (record.improved) {
    finalRecord.innerHTML = `<span class="new-record-label">NUEVO RÉCORD</span> ${record.next}`;
    finalRecord.classList.add('pulse-animation');
    // Celebration particles
    for (let i = 0; i < 60; i++) {
      bursts.push({
        x: state.width / 2 + random(-120, 120),
        y: state.height / 2 + random(-120, 120),
        ttl: random(1.0, 2.2),
        life: 0,
        radius: random(4, 14),
        color: ['#f28c28', '#6ea64f', '#39a8ff', '#ff3f66', '#ffd700'][Math.floor(Math.random() * 5)],
        vx: random(-250, 250),
        vy: random(-500, -150)
      });
    }
  } else {
    finalRecord.textContent = String(record.next);
    finalRecord.classList.remove('pulse-animation');
  }
  buildLevelMenu();
  setActiveOverlay(gameOver);
  syncGameChrome();
}

window.HamsterRunPauseControls = {
  getMode: () => state.mode,
  pause() {
    if (state.mode !== 'running') return false;
    state.mode = 'paused';
    syncGameChrome();
    return true;
  },
  resume() {
    if (state.mode !== 'paused') return false;
    state.mode = 'running';
    state.last = performance.now();
    setActiveOverlay(null);
    syncGameChrome();
    return true;
  },
  restartLevel() {
    resetGame();
    return true;
  },
  goHome() {
    state.mode = 'menu';
    setActiveOverlay(home);
    syncGameChrome();
    return true;
  },
};

function updateHud() {
  scoreEl.textContent = Math.floor(state.score);
  peanutsEl.textContent = state.peanuts;
  
  const displayTime = modeTimeLeft !== null ? modeTimeLeft : state.time;
  timeEl.textContent = displayTime.toFixed(1) + 's';
  
  livesEl.textContent = '❤️'.repeat(Math.max(0, state.lives));
}

function draw() {
  const theme = backgroundThemes[state.level.backgroundSet] || backgroundThemes.meadow;
  const hill = state.level.palette[1];
  const sun = state.level.palette[2];

  ctx.save();
  ctx.clearRect(0, 0, state.width, state.height);
  if (state.shake > 0) ctx.translate(random(-state.shake, state.shake), random(-state.shake, state.shake));

  drawBackground(hill, sun);

  if (state.mode === 'running' || state.mode === 'over' || state.mode === 'paused') {
    decor.forEach((item) => { ctx.drawImage(sprites.grass, item.x, item.y, item.size, item.size); });
    platforms.forEach(drawPlatform);
    drawTutorialPrompts();
    peanuts.forEach(drawPeanut);
    hearts.forEach(drawHeart);
    powerUps.forEach(drawPowerUp);
    enemies.forEach(drawEnemy);
    bursts.forEach(drawBurst);
    drawHamster();
    drawPowerUpIndicators();
    feedbacks.forEach(drawFeedbackItem);
  }

  ctx.restore();
  drawHeroPreview();
}

function drawPowerUp(p) {
  const def = POWER_UP_TYPES[p.type];
  const bounce = Math.sin(state.time * 5 + p.bob) * 6;
  const pulse = 1 + Math.sin(p.pulse) * 0.12;
  const size = p.size * pulse;

  ctx.save();
  ctx.shadowColor = def.glow;
  ctx.shadowBlur = 18;
  ctx.fillStyle = def.color;
  ctx.beginPath();
  ctx.arc(p.x + p.size / 2, p.y + p.size / 2 + bounce, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#fff';
  ctx.font = '900 14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(def.label[0].toUpperCase(), p.x + p.size / 2, p.y + p.size / 2 + bounce + 1);
}

function drawPowerUpIndicators() {
  const active = Object.entries(powerUpEffects).filter(([_, time]) => time > 0);
  if (!active.length) return;

  active.forEach(([type, time], index) => {
    const def = POWER_UP_TYPES[type];
    const x = player.x + player.width / 2;
    const y = player.y - 48 - index * 24;
    const progress = time / def.duration;

    ctx.save();
    ctx.globalAlpha = 0.85;
    
    // Background bar with glossy look
    ctx.fillStyle = 'rgba(12, 18, 14, 0.72)';
    roundRect(x - 44, y, 88, 22, 11);
    ctx.fill();

    // Progress bar with glow
    ctx.shadowBlur = 12;
    ctx.shadowColor = def.color;
    ctx.fillStyle = def.color;
    roundRect(x - 44, y, 88 * progress, 22, 11);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text with better legibility
    ctx.fillStyle = '#fff';
    ctx.font = '1000 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(`${def.label.toUpperCase()} ${time.toFixed(1)}S`, x, y + 15);
    
    ctx.restore();
  });
}

function playSound(name) {
  window.HamsterRunAudio?.play?.(name);
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

  const bgCanvas = ctx.canvas;
  const bgStyle = state.level.background ? `url(${state.level.background}) center / cover no-repeat` : `linear-gradient(180deg, ${theme.skyTop} 0%, ${theme.skyBottom} 62%, ${theme.ground} 62%, ${theme.ground} 100%)`;
  if (bgCanvas.style.background !== bgStyle) bgCanvas.style.background = bgStyle;

  if (state.level.background) {
    ctx.fillStyle = sun;
    for (let i = 0; i < 18; i += 1) {
      const x = (i * 91 - (state.distance * 0.22) % 91) % (state.width + 120);
      ctx.fillRect(x - 20, state.height - 18, 54, 18);
    }
    return;
  }

  for (let i = 0; i < 3; i += 1) {
    const layerSpeed = 0.05 + i * 0.025;
    const offset = ((state.distance * layerSpeed) % state.width) * -1;
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

  if (state.level.backgroundSet !== 'none') {
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
  }
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

  if (state.invincible > 0 && Math.floor(state.time * 20) % 2 === 0) {
    ctx.save();
    ctx.filter = 'brightness(2) contrast(1.2)';
    ctx.globalAlpha = 0.42;
    drawSheetFrame(character.sprite, sx, 0, player.x - 20, player.y - 32 + squash, player.width + 40, player.height + 46 - squash);
    ctx.restore();
  }

  if (powerUpEffects.invincible > 0) {
    ctx.save();
    ctx.shadowColor = 'rgba(255, 216, 74, 0.82)';
    ctx.shadowBlur = 24;
    ctx.filter = `hue-rotate(${state.time * 180}deg) brightness(1.2)`;
    drawSheetFrame(character.sprite, sx, 0, player.x - 17, player.y - 28 + squash, player.width + 34, player.height + 38 - squash);
    ctx.restore();
  } else {
    drawSheetFrame(character.sprite, sx, 0, player.x - 17, player.y - 28 + squash, player.width + 34, player.height + 38 - squash);
  }
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
  if (perfProbe.enabled) { perfProbe.frames += 1; perfProbe.acc += dt; if (perfProbe.acc >= 1) { console.log(`FPS: ${Math.round(perfProbe.frames / perfProbe.acc)}`); perfProbe.frames = 0; perfProbe.acc = 0; } }
  requestAnimationFrame(loop);
}

function clearPowerUpEffects() {
  powerUpEffects.jumps = 0;
  powerUpEffects.speed = 0;
  powerUpEffects.invincible = 0;
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
retryButton.addEventListener('click', resetGame);
levelsButton.addEventListener('click', showLevelSelect);

function installConsolidatedPolish() {
  const style = document.createElement('style');
  style.id = 'consolidatedGameStyles';
  style.textContent = `
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
    #menu .level-panel { display: flex !important; flex-direction: column !important; min-height: 0 !important; overflow: hidden !important; }
    #menu .selection-brand { position: relative !important; z-index: 1 !important; display: grid !important; grid-template-columns: 86px 1fr !important; align-items: center !important; flex: 0 0 auto !important; gap: 12px !important; margin: 0 0 12px !important; border-radius: 14px !important; background: rgba(255, 249, 230, 0.58) !important; padding: 8px 12px !important; }
    #menu .selection-brand canvas { display: block !important; width: 86px !important; height: 58px !important; }
    #menu .selection-brand-title { color: #24140a !important; font-size: clamp(1.8rem, 8vw, 3rem) !important; font-weight: 1000 !important; letter-spacing: -0.05em !important; line-height: 0.9 !important; text-shadow: 0 3px 0 rgba(242, 140, 40, 0.22) !important; }
    #pauseActionMenu { z-index: 40 !important; }
    #pauseActionMenu .pause-action-panel { width: min(92vw, 460px) !important; max-height: calc(100dvh - 34px) !important; }

    .pulse-animation { animation: pulseRecord 1s infinite alternate; }
    @keyframes pulseRecord { from { transform: scale(1); } to { transform: scale(1.05); } }

    /* Botones Planos */
    .primary-button { background: #f28c28 !important; color: #2d1608 !important; border-radius: 12px !important; box-shadow: none !important; }
    .ghost-button { background: #6ea64f !important; color: #10250f !important; border-radius: 12px !important; box-shadow: none !important; }
    .mode-card, .character-card, .level-card { border-radius: 14px !important; background: #fff4d6 !important; border: 2px solid rgba(0,0,0,0.05) !important; box-shadow: none !important; }
    .mode-card[aria-pressed='true'], .character-card[aria-pressed='true'], .level-card[aria-pressed='true'] { background: #d9f0a7 !important; border-color: #6ea64f !important; }
    .level-card p { display: none !important; }

    /* Mejora Pantalla Resultados (Estética Hamster Run) */
    #gameOver .panel { background: #fff9e6 !important; color: #24140a !important; border: 4px solid #fff !important; border-top: 12px solid #f28c28 !important; text-align: center !important; }
    #gameOver .result-grid { display: grid !important; grid-template-columns: 1fr !important; gap: 12px !important; background: transparent !important; padding: 0 !important; }
    #gameOver .result-grid div { background: #fff !important; border: 2px solid rgba(0,0,0,0.04) !important; border-radius: 12px !important; padding: 12px 16px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; min-height: 52px !important; }
    
    /* Puntos (Especial) */
    #gameOver .result-grid div:first-child { flex-direction: column !important; padding: 24px 16px !important; min-height: 140px !important; gap: 4px !important; }
    #gameOver .result-grid div:first-child span { order: 1 !important; margin-bottom: 4px !important; }
    #finalScore { order: 2 !important; font-size: 3.2rem !important; font-weight: 1000 !important; line-height: 1 !important; margin: 4px 0 !important; }
    #finalScore::after { content: attr(data-rank); display: block; order: 3; font-size: 0.85rem; padding: 6px 14px; background: #f28c28; color: #2d1608; border-radius: 10px; margin-top: 10px; box-shadow: 0 4px 10px rgba(242, 140, 40, 0.2); }

    #gameOver .result-grid span { color: #7a3f16 !important; font-size: 0.65rem !important; text-transform: uppercase !important; font-weight: 900 !important; letter-spacing: 0.1em !important; }
    #gameOver .result-grid strong { color: #24140a !important; font-size: 1.2rem !important; }
    
    .new-record-label { display: block; font-size: 0.65rem; color: #f28c28; font-weight: 1000; letter-spacing: 0.12em; margin-bottom: 2px; }
    #gameOver .panel::before { display: none !important; }
    .hint { display: none !important; }
  `;
  document.head.append(style);

  installPauseMenu();
  installSelectionHeader();
  installHomeButtonsFix();
}

function installPauseMenu() {
  const PAUSE_MENU_ID = 'pauseActionMenu';
  let overlay = document.querySelector(`#${PAUSE_MENU_ID}`);
  if (overlay) return;
  overlay = document.createElement('section');
  overlay.id = PAUSE_MENU_ID;
  overlay.className = 'overlay pause-action-overlay';
  overlay.hidden = true;
  overlay.setAttribute('aria-label', 'Pausa');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="panel pause-action-panel">
      <div class="screen-header screen-header--center">
        <p class="eyebrow">Partida pausada</p>
        <h2>Pausa</h2>
        <p class="copy">¿Qué quieres hacer?</p>
      </div>
      <div class="menu-actions pause-action-buttons" aria-label="Opciones de pausa">
        <button id="pauseContinueButton" class="primary-button" type="button">Continuar</button>
        <button id="pauseRestartButton" class="ghost-button" type="button">Reiniciar nivel</button>
        <button id="pauseHomeButton" class="ghost-button" type="button">Volver al inicio</button>
      </div>
    </div>
  `;
  document.querySelector('.game-shell')?.append(overlay);
  overlay.querySelector('#pauseContinueButton')?.addEventListener('click', () => window.HamsterRunPauseControls.resume());
  overlay.querySelector('#pauseRestartButton')?.addEventListener('click', () => window.HamsterRunPauseControls.restartLevel());
  overlay.querySelector('#pauseHomeButton')?.addEventListener('click', () => window.HamsterRunPauseControls.goHome());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.mode === 'running') showPauseMenu();
    else if (e.key === 'Escape' && state.mode === 'paused') window.HamsterRunPauseControls.resume();
  });
}

function showPauseMenu() {
  if (window.HamsterRunPauseControls.pause()) {
    const overlay = document.querySelector('#pauseActionMenu');
    if (overlay) {
      overlay.hidden = false;
      overlay.classList.add('is-visible');
      overlay.setAttribute('aria-hidden', 'false');
      overlay.querySelector('#pauseContinueButton')?.focus();
    }
  }
}

function installSelectionHeader() {
  const panel = document.querySelector('#menu .level-panel');
  if (!panel || panel.querySelector('.selection-brand')) return;
  const header = document.createElement('div');
  header.className = 'selection-brand';
  header.innerHTML = `<canvas class="selection-brand-runner" width="172" height="116"></canvas><strong class="selection-brand-title">Hamster Run</strong>`;
  panel.insertBefore(header, panel.firstElementChild);
  const canvas = header.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const draw = (now) => {
    if (!panel.classList.contains('is-visible')) { requestAnimationFrame(draw); return; }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 86 * dpr; canvas.height = 58 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, 86, 58);
    const frame = Math.floor(now / 110) % 4;
    ctx.drawImage(sprites.hamster.image, frame * 192, 0, 192, 192, 5, 2 + Math.sin(now / 130) * 2, 76, 56);
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}

function installHomeButtonsFix() {
  const selectors = '#newGameButton,#aboutButton,#shareButton,#startButton,#backHomeButton,#retryButton,#levelsButton';
  document.addEventListener('click', (e) => {
    const btn = e.target.closest(selectors);
    if (!btn) return;
    if (btn.id === 'aboutButton') { e.preventDefault(); e.stopImmediatePropagation(); window.alert('Toca para saltar. Doble salto disponible. Recoge nueces y corazones!'); }
    if (btn.id === 'shareButton') { e.preventDefault(); e.stopImmediatePropagation(); shareGame(); }
    if (btn.id === 'gameMenuButton') { e.preventDefault(); e.stopImmediatePropagation(); showPauseMenu(); }
  }, { capture: true });
}

installConsolidatedPolish();

resize();
applyCharacter();
buildCharacterMenu();
buildLevelMenu();
showHome();
syncGameChrome();
requestAnimationFrame(loop);
