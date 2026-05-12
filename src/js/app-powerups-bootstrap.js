import appSource from './app.js?raw';
import '../css/main.css';
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

const assetUrls = {
  '../assets/sprites/hamster/sheet-transparent.png': hamsterSheet,
  '../assets/sprites/characters/blue-hamster/sheet-transparent.png': blueHamsterSheet,
  '../assets/sprites/characters/tasmanian/sheet-transparent.png': tasmanianSheet,
  '../assets/sprites/death/hamster-angel/sheet-transparent.png': hamsterAngelSheet,
  '../assets/sprites/death/blue-hamster-angel/sheet-transparent.png': blueHamsterAngelSheet,
  '../assets/sprites/death/tasmanian-angel/sheet-transparent.png': tasmanianAngelSheet,
  '../assets/sprites/peanut/sheet-transparent.png': peanutSheet,
  '../assets/sprites/heart/sheet-transparent.png': heartSheet,
  '../assets/sprites/enemy/sheet-transparent.png': enemySheet,
  '../assets/sprites/enemies/ground/sheet-transparent.png': groundEnemySheet,
  '../assets/sprites/enemies/flying/sheet-transparent.png': flyingEnemySheet,
  '../assets/sprites/enemies/chestnut/sheet-transparent.png': chestnutEnemySheet,
  '../assets/sprites/platforms/platform-1.png': platformWoodLong,
  '../assets/sprites/platforms/platform-2.png': platformWoodMedium,
  '../assets/sprites/platforms/platform-3.png': platformWoodShort,
  '../assets/sprites/platforms/platform-4.png': platformDirt,
  '../assets/sprites/platforms/platform-5.png': platformStraw,
  '../assets/sprites/platforms/platform-6.png': platformMushroom,
  '../assets/sprites/background/background-1.png': cloudSprite,
  '../assets/sprites/background/background-2.png': treeSprite,
  '../assets/sprites/background/background-3.png': hillSprite,
  '../assets/sprites/background/background-4.png': barnSprite,
  '../assets/sprites/background/background-5.png': moonSprite,
  '../assets/sprites/background/background-6.png': haySprite,
  '../assets/sprites/environment/environment-3.png': thistleSprite,
  '../assets/sprites/environment/environment-4.png': grassSprite,
};

function inlineImports(source) {
  return source
    .replace(/^import '\.\.\/css\/main\.css';\s*$/m, '')
    .replace(/^import\s+(\w+)\s+from\s+'([^']+)';\s*$/gm, (match, name, specifier) => Object.hasOwn(assetUrls, specifier) ? `const ${name} = ${JSON.stringify(assetUrls[specifier])};` : match);
}

function patchSource(source) {
  let patched = source
    .replace(/function\s+readRecords\s*\(/g, 'function originalReadRecords(')
    .replace(/function\s+saveRecord\s*\(/g, 'function originalSaveRecord(')
    .replace(/function\s+resetGame\s*\(/g, 'function originalResetGame(')
    .replace(/function\s+currentDifficulty\s*\(/g, 'function originalCurrentDifficulty(')
    .replace(/function\s+canStomp\s*\(/g, 'function originalCanStomp(')
    .replace(/function\s+stompEnemy\s*\(/g, 'function originalStompEnemy(')
    .replace(/function\s+loseLife\s*\(/g, 'function originalLoseLife(')
    .replace(/function\s+respawnPlayerAfterLifeLoss\s*\(/g, 'function originalRespawnPlayerAfterLifeLoss(')
    .replace(/function\s+jump\s*\(/g, 'function originalJump(')
    .replace(/function\s+endGame\s*\(/g, 'function originalEndGame(')
    .replace(/return clamp\(\(state\.distance - 650\) \/ 5200, 0, 1\);/g, 'return clamp((state.distance - 450) / 3400, 0, 1);');

  if (!/function\s+itemBox\s*\(/.test(patched)) {
    patched += `\nfunction itemBox(item) {\n  const size = item.size || Math.max(item.width || 0, item.height || 0) || 28;\n  return { x: item.x, y: item.y, width: item.width || size, height: item.height || size };\n}\n`;
  }

  patched += `

const MODE_RECORD_KEY = RECORD_KEY + '-by-mode-v1';
const lifeGhosts = [];
const perfProbe = { enabled: new URLSearchParams(window.location.search).has('debugFps'), frames: 0, acc: 0 };
let lifeGhostCanvas = null;
let lifeGhostCtx = null;
let lifeGhostAnimation = 0;
let lifeGhostLast = 0;
let lifeRespawnDelay = 0;
let pendingRespawnPoint = null;
let currentGameMode = window.HamsterRunModes?.getSelectedMode?.() || { id: 'endless', name: 'Endless', timeLimit: null, seed: null };
let modeTimeLeft = null;
let seededRandom = null;

const powerUps = [];
const powerUpEffects = { jumps: 0, speed: 0, invincible: 0 };
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

function selectedMode() {
  return currentGameMode || window.HamsterRunModes?.getSelectedMode?.() || { id: 'endless', name: 'Endless', timeLimit: null, seed: null };
}

function readRecords() {
  try {
    const modeRecords = JSON.parse(localStorage.getItem(MODE_RECORD_KEY) || '{}');
    const legacy = originalReadRecords();
    for (const [levelId, value] of Object.entries(legacy)) {
      const key = 'endless:' + levelId;
      modeRecords[key] = Math.max(modeRecords[key] || 0, Number(value) || 0);
    }
    return modeRecords;
  } catch {
    return {};
  }
}

function saveRecord(levelId, score) {
  const mode = selectedMode();
  const records = readRecords();
  const key = mode.id + ':' + levelId;
  const previous = records[key] || 0;
  const next = Math.max(previous, Math.floor(score));
  records[key] = next;
  localStorage.setItem(MODE_RECORD_KEY, JSON.stringify(records));
  return { previous, next, improved: next > previous };
}

function modeRecord(levelId) {
  return readRecords()[selectedMode().id + ':' + levelId] || 0;
}

function resetGame() {
  currentGameMode = window.HamsterRunModes?.getSelectedMode?.() || selectedMode();
  modeTimeLeft = currentGameMode.timeLimit ?? null;
  seededRandom = currentGameMode.seed ? makeSeededRandom(String(currentGameMode.seed) + ':' + state.selectedLevel) : null;
  powerUps.length = 0;
  clearPowerUpEffects();

  withModeRandom(() => originalResetGame());
  improveStarterPlatforms();
  updateModeHud();
}

function improveStarterPlatforms() {
  if (state.level?.tutorial || platforms.length < 2) return;

  const floor = state.height * 0.7;
  const first = platforms[0];
  const second = platforms[1];
  const oldSecondEnd = second.x + second.width;

  first.x = -34;
  first.y = floor;
  first.baseY = floor;
  first.width = clamp(state.width * 0.74, 292, 348);
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

function currentDifficulty() {
  const base = originalCurrentDifficulty();
  return clamp(base + (selectedMode().difficultyBoost || 0), 0, 1);
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

function jump() {
  const jumpsBefore = player.jumps;
  const modeBefore = state.mode;
  originalJump();
  if (modeBefore === 'running' && player.jumps === jumpsBefore && canUseExtraPowerJump()) {
    player.vy = -state.level.jump;
    player.jumps += 1;
    player.grounded = false;
  }
  if (modeBefore === 'running' && player.jumps > jumpsBefore) playSound(jumpsBefore > 0 ? 'doubleJump' : 'jump');
}

function canUseExtraPowerJump() {
  const maxJumps = powerUpEffects.jumps > 0 ? 4 : 2;
  return state.mode === 'running' && !player.grounded && player.jumps < maxJumps;
}

function endGame() {
  if (state.mode === 'running') playSound('gameOver');
  originalEndGame();
}

function playSound(name) {
  window.HamsterRunAudio?.play?.(name);
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

const originalTutorialPlatformSpecWithPowerUps = typeof tutorialPlatformSpec === 'function' ? tutorialPlatformSpec : null;
if (originalTutorialPlatformSpecWithPowerUps) {
  tutorialPlatformSpec = function tutorialPlatformSpecWithPowerUps(index) {
    return TUTORIAL_POWER_UPS[index] || originalTutorialPlatformSpecWithPowerUps(index);
  };
}

const originalSpawnTutorialItemsWithPowerUps = typeof spawnTutorialItems === 'function' ? spawnTutorialItems : null;
if (originalSpawnTutorialItemsWithPowerUps) {
  spawnTutorialItems = function spawnTutorialItemsWithPowerUps(platform, spec) {
    originalSpawnTutorialItemsWithPowerUps(platform, spec);
    if (spec?.powerUp) spawnPowerUp(platform, spec.powerUp, 0.56);
  };
}

const originalSpawnPlatformWithPowerUps = typeof spawnPlatform === 'function' ? spawnPlatform : null;
if (originalSpawnPlatformWithPowerUps) {
  spawnPlatform = function spawnPlatformWithPowerUps(previous) {
    originalSpawnPlatformWithPowerUps(previous);
    const platform = platforms[platforms.length - 1];
    maybeSpawnPowerUp(platform);
  };
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

function updatePowerUps(dt) {
  if (state.mode !== 'running') return;
  for (const key of Object.keys(powerUpEffects)) {
    powerUpEffects[key] = Math.max(0, powerUpEffects[key] - dt);
  }
  state.speedBoost = powerUpEffects.speed > 0 ? POWER_UP_TYPES.speed.boost : 0;
  if (powerUpEffects.invincible > 0) state.invincible = Math.max(state.invincible, Math.min(0.35, powerUpEffects.invincible + 0.05));

  const scrollSpeed = ((state.level?.speed || 0) + (state.speedBoost || 0)) * dt;
  const playerHitbox = playerBox(8);
  for (let index = powerUps.length - 1; index >= 0; index -= 1) {
    const powerUp = powerUps[index];
    const platform = platforms.find((item) => item.id === powerUp.platformId);
    if (platform) {
      powerUp.y = platform.y - powerUp.yOffset;
    } else {
      powerUp.x -= scrollSpeed;
    }
    powerUp.bob += dt * 4.6;
    powerUp.pulse += dt * 5.2;
    if (!powerUp.taken && boxesOverlap(playerHitbox, itemBox(powerUp))) collectPowerUp(powerUp);
    if (powerUp.taken || powerUp.x + powerUp.size < -80) powerUps.splice(index, 1);
  }
}

function boxesOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function collectPowerUp(powerUp) {
  const def = POWER_UP_TYPES[powerUp.type];
  powerUp.taken = true;
  powerUpEffects[powerUp.type] = Math.max(powerUpEffects[powerUp.type], def.duration);
  state.score += def.score;
  if (powerUp.type === 'invincible') state.invincible = Math.max(state.invincible, def.duration);
  if (powerUp.type === 'speed') state.speedBoost = def.boost;
  bursts.push({ x: powerUp.x + powerUp.size / 2, y: powerUp.y + powerUp.size / 2, ttl: 0.52, life: 0.52, radius: 32, color: def.glow });
  playSound(powerUp.type === 'speed' ? 'peanut' : 'heart');
  updateHud();
}

function clearPowerUpEffects() {
  powerUpEffects.jumps = 0;
  powerUpEffects.speed = 0;
  powerUpEffects.invincible = 0;
  state.speedBoost = 0;
}

function activePowerUpEntries() {
  return Object.entries(powerUpEffects)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);
}

function drawPowerUps() {
  if (!ctx || !powerUps.length) return;
  for (const powerUp of powerUps) drawPowerUp(powerUp);
}

function drawPowerUp(powerUp) {
  const def = POWER_UP_TYPES[powerUp.type];
  const radius = powerUp.size / 2;
  const cx = powerUp.x + radius;
  const cy = powerUp.y + radius + Math.sin(powerUp.bob) * 5;
  const pulse = 1 + Math.sin(powerUp.pulse) * 0.08;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.shadowColor = def.glow;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * pulse, 0, Math.PI * 2);
  ctx.fillStyle = def.color;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.86)';
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.beginPath();
  ctx.arc(cx - radius * 0.34, cy - radius * 0.36, radius * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPowerUpTimerOverlay() {
  if (!ctx || state.mode !== 'running') return;
  const entries = activePowerUpEntries();
  if (!entries.length) return;
  const topEntry = entries[0];
  const def = POWER_UP_TYPES[topEntry[0]];
  const seconds = Math.ceil(topEntry[1]);
  const text = def.label + ' ' + seconds + 's';
  const x = clamp(player.x + player.width / 2, 88, state.width - 88);
  const y = Math.max(56, player.y - 34);
  ctx.save();
  ctx.font = '800 16px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const width = Math.min(190, ctx.measureText(text).width + 34);
  ctx.fillStyle = 'rgba(20, 24, 36, 0.74)';
  powerUpRoundRect(ctx, x - width / 2, y - 18, width, 36, 18);
  ctx.fill();
  ctx.strokeStyle = def.color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawInvincibleGlow() {
  if (!ctx || powerUpEffects.invincible <= 0 || state.mode !== 'running') return;
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;
  const radius = Math.max(player.width, player.height) * (0.86 + Math.sin(state.time * 14) * 0.08);
  ctx.save();
  ctx.globalAlpha = 0.68;
  ctx.shadowColor = POWER_UP_TYPES.invincible.glow;
  ctx.shadowBlur = 22;
  ctx.strokeStyle = '#ffe972';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#fff3a3';
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.88, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function powerUpRoundRect(targetCtx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  targetCtx.beginPath();
  targetCtx.moveTo(x + r, y);
  targetCtx.arcTo(x + width, y, x + width, y + height, r);
  targetCtx.arcTo(x + width, y + height, x, y + height, r);
  targetCtx.arcTo(x, y + height, x, y, r);
  targetCtx.arcTo(x, y, x + width, y, r);
  targetCtx.closePath();
}

function drawPowerUpLayer() {
  drawInvincibleGlow();
  drawPowerUps();
  drawPowerUpTimerOverlay();
}

if (typeof draw === 'function') {
  const originalDraw = draw;
  draw = function drawWithPowerUps() {
    originalDraw();
    drawPowerUpLayer();
  };
} else if (typeof render === 'function') {
  const originalRender = render;
  render = function renderWithPowerUps() {
    originalRender();
    drawPowerUpLayer();
  };
}

const originalUpdate = update;
update = function updateWithPatches(dt) {
  if (lifeRespawnDelay > 0) {
    lifeRespawnDelay = Math.max(0, lifeRespawnDelay - dt);
    state.time += dt;
    state.invincible = Math.max(state.invincible, 1.45);
    state.shake = Math.max(0, state.shake - dt * 18);
    updatePowerUps(dt);
    if (lifeRespawnDelay === 0) respawnPlayerAfterLifeLoss();
    cleanupLongRunEntities();
    updatePerfProbe(dt);
    return;
  }

  const peanutsBefore = state.peanuts;
  const livesBefore = state.lives;
  withModeRandom(() => originalUpdate(dt));
  updateModeTimer(dt);
  updatePowerUps(dt);
  if (state.peanuts > peanutsBefore) playSound('peanut');
  if (state.lives > livesBefore) playSound('heart');
  cleanupLongRunEntities();
  updatePerfProbe(dt);
};

function updateModeTimer(dt) {
  if (state.mode !== 'running' || modeTimeLeft === null) return;
  modeTimeLeft = Math.max(0, modeTimeLeft - dt);
  updateModeHud();
  if (modeTimeLeft <= 0) endGame();
}

function updateModeHud() {
  const mode = selectedMode();
  const label = mode.timeLimit ? Math.ceil(modeTimeLeft ?? mode.timeLimit) + 's' : Math.floor(state.time) + 's';
  timeEl.textContent = label;
  timeEl.previousElementSibling.textContent = mode.timeLimit ? 'Resta' : 'Tiempo';
}

const originalUpdateHud = updateHud;
updateHud = function updateHudWithExtras() {
  originalUpdateHud();
  renderLifeHearts();
  updateModeHud();
};

function cleanupLongRunEntities() {
  pruneEntityList(platforms, (platform) => platform.x + platform.width > -180, 82);
  pruneEntityList(peanuts, (peanut) => peanut.x > -160 && !peanut.taken, 140);
  pruneEntityList(hearts, (heart) => heart.x > -160 && !heart.taken, 24);
  pruneEntityList(powerUps, (powerUp) => powerUp.x > -160 && !powerUp.taken, 34);
  pruneEntityList(enemies, (enemy) => enemy.x > -180 && !enemy.defeated, 48);
  pruneEntityList(decor, (item) => item.x > -180, 70);
  pruneEntityList(bursts, (burst) => (burst.ttl ?? 0) > 0, 46);
  pruneEntityList(backgroundProps, (prop) => prop.x > -260, 18);
}

function pruneEntityList(list, keep, maxLength) {
  let writeIndex = 0;
  for (let readIndex = 0; readIndex < list.length; readIndex += 1) {
    const item = list[readIndex];
    if (keep(item)) { list[writeIndex] = item; writeIndex += 1; }
  }
  list.length = writeIndex;
  if (list.length > maxLength) list.splice(0, list.length - maxLength);
}

function updatePerfProbe(dt) {
  if (!perfProbe.enabled || state.mode !== 'running') return;
  perfProbe.frames += 1;
  perfProbe.acc += dt;
  if (perfProbe.acc >= 1) {
    const fps = Math.round(perfProbe.frames / perfProbe.acc);
    perfProbe.frames = 0;
    perfProbe.acc = 0;
    if (fps < 45) console.info('[Hamster Run] FPS bajos', { fps, platforms: platforms.length, peanuts: peanuts.length, hearts: hearts.length, powerUps: powerUps.length, enemies: enemies.length, decor: decor.length, bursts: bursts.length });
  }
}

function setupMobileSafeControls() {
  const interactiveSelector = 'button, a, input, textarea, select, [role="button"], .overlay.is-visible *';
  let lastTouchEnd = 0;
  document.addEventListener('gesturestart', (event) => event.preventDefault(), { passive: false });
  document.addEventListener('touchend', (event) => { const now = Date.now(); if (now - lastTouchEnd <= 340) event.preventDefault(); lastTouchEnd = now; }, { passive: false });
  canvas.addEventListener('pointerdown', (event) => { if (event.target.closest?.(interactiveSelector) || state.mode !== 'running' || lifeRespawnDelay > 0) return; event.preventDefault(); event.stopImmediatePropagation(); canvas.setPointerCapture?.(event.pointerId); jump(); }, { passive: false, capture: true });
  window.addEventListener('keydown', (event) => { if ((event.code === 'Space' || event.code === 'ArrowUp') && state.mode === 'running') event.preventDefault(); }, { passive: false, capture: true });
  gameMenuButton?.addEventListener('click', () => playSound('pause'), { capture: true });
}

function renderLifeHearts() {
  if (!livesEl) return;
  const visibleLives = Math.max(0, Math.floor(state.lives));
  livesEl.textContent = '♥'.repeat(visibleLives);
  livesEl.style.backgroundImage = 'none';
  livesEl.style.width = 'auto';
  livesEl.setAttribute('aria-label', visibleLives === 1 ? '1 vida' : visibleLives + ' vidas');
}

window.addEventListener('hamster-run-mode-change', (event) => {
  currentGameMode = event.detail || selectedMode();
  buildLevelMenu();
});

setupMobileSafeControls();
updateHud();
`;

  return patched;
}

const patchedSource = patchSource(inlineImports(appSource));
const patchedModuleUrl = URL.createObjectURL(new Blob([patchedSource], { type: 'text/javascript' }));

import(patchedModuleUrl)
  .catch((error) => console.error('No se pudo cargar Hamster Run', error))
  .finally(() => URL.revokeObjectURL(patchedModuleUrl));
