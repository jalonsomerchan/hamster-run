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
    .replace(/state\.lives = 3;/g, 'state.lives = Math.min(3, maxLivesForCurrentLevel());')
    .replace(/state\.lives \+= 1;/g, 'state.lives = Math.min(maxLivesForCurrentLevel(), state.lives + 1);')
    .replace(/state\.lives = state\.lives \+ 1;/g, 'state.lives = Math.min(maxLivesForCurrentLevel(), state.lives + 1);')
    .replace(/state\.lives < 5/g, 'state.lives < maxLivesForCurrentLevel()');

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

function selectedMode() {
  return currentGameMode || window.HamsterRunModes?.getSelectedMode?.() || { id: 'endless', name: 'Endless', timeLimit: null, seed: null };
}

function maxLivesForCurrentLevel() {
  const configuredMax = Number(state.level?.maxLives ?? state.level?.max_lives ?? 5);
  if (!Number.isFinite(configuredMax) || configuredMax < 1) return 5;
  return Math.floor(configuredMax);
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

  withModeRandom(() => originalResetGame());
  state.lives = Math.min(state.lives, maxLivesForCurrentLevel());
  updateModeHud();
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
  if (modeBefore === 'running' && player.jumps > jumpsBefore) playSound(jumpsBefore > 0 ? 'doubleJump' : 'jump');
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

const originalUpdate = update;
update = function updateWithPatches(dt) {
  if (lifeRespawnDelay > 0) {
    lifeRespawnDelay = Math.max(0, lifeRespawnDelay - dt);
    state.time += dt;
    state.invincible = Math.max(state.invincible, 1.45);
    state.shake = Math.max(0, state.shake - dt * 18);
    if (lifeRespawnDelay === 0) respawnPlayerAfterLifeLoss();
    cleanupLongRunEntities();
    updatePerfProbe(dt);
    return;
  }

  const peanutsBefore = state.peanuts;
  const livesBefore = state.lives;
  withModeRandom(() => originalUpdate(dt));
  state.lives = Math.min(state.lives, maxLivesForCurrentLevel());
  updateModeTimer(dt);
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
    if (fps < 45) console.info('[Hamster Run] FPS bajos', { fps, platforms: platforms.length, peanuts: peanuts.length, hearts: hearts.length, enemies: enemies.length, decor: decor.length, bursts: bursts.length });
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
  const visibleLives = Math.max(0, Math.min(maxLivesForCurrentLevel(), Math.floor(state.lives)));
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
