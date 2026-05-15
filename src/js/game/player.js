import { characters } from '../config/gameConfig.js';
import { clamp } from '../utils/math.js';
import { state, player, platforms, enemies, bursts, powerUpEffects } from './state.js';

let lifeGhostCanvas = null;
let lifeGhostCtx = null;
let lifeGhostAnimation = 0;
let lifeGhostLast = 0;
let lifeRespawnDelay = 0;
const lifeGhosts = [];

export function getLifeRespawnDelay() { return lifeRespawnDelay; }
export function setLifeRespawnDelay(value) { lifeRespawnDelay = value; }

export function playSound(name) {
  window.HamsterRunAudio?.play?.(name);
}

export function selectedCharacter() {
  return characters[state.selectedCharacter] || characters[0];
}

export function applyCharacter() {
  const character = selectedCharacter();
  player.width = character.width;
  player.height = character.height;
}

export function jump() {
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

export function loseLife(endGame, updateHud) {
  if (state.mode !== 'running' || state.invincible > 0 || lifeRespawnDelay > 0) return;
  playSound('damage');
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

/** Fixed respawn x — always the same screen position as the initial spawn. */
const RESPAWN_X = () => Math.max(58, state.width * 0.18);

/**
 * Find the best platform to respawn on — always recalculated at respawn time.
 * The player ALWAYS spawns at the same fixed left-side x position.
 */
function findSafeRespawnPlatform() {
  const fixedX = RESPAWN_X();
  const minPlatformWidth = player.width + 40;

  // 1. Find a platform that fully covers the fixed x position
  const covering = platforms.find(
    (p) => p.width >= minPlatformWidth &&
      p.x <= fixedX &&
      p.x + p.width >= fixedX + player.width,
  );
  if (covering) {
    return { x: fixedX, y: (covering.baseY ?? covering.y) - player.height };
  }

  // 2. Find the nearest platform to the right of fixedX (player will land on its left side)
  const rightOf = platforms
    .filter((p) => p.width >= minPlatformWidth && p.x > fixedX - player.width)
    .sort((a, b) => a.x - b.x);

  if (rightOf.length) {
    const best = rightOf[0];
    return { x: fixedX, y: (best.baseY ?? best.y) - player.height };
  }

  // 3. Last resort: widest visible platform, place at its left edge
  const visible = platforms.filter(
    (p) => p.x + p.width > 0 && p.x < state.width + 60 && p.width >= minPlatformWidth,
  );
  if (!visible.length) return null;

  const widest = visible.reduce((a, b) => (b.width > a.width ? b : a), visible[0]);
  return { x: widest.x + 30, y: (widest.baseY ?? widest.y) - player.height };
}

export function respawnPlayerAfterLifeLoss(endGame) {
  const result = findSafeRespawnPlatform();
  if (!result) { endGame(); return; }

  player.x = result.x;
  player.y = result.y;
  player.vy = 0;
  player.jumps = 0;
  player.grounded = true;

  // Clear nearby enemies so the player doesn't die instantly
  const dangerPadding = 200;
  enemies.splice(0, enemies.length, ...enemies.filter((enemy) => {
    const enemyCenter = enemy.x + enemy.width / 2;
    return enemyCenter < player.x - dangerPadding || enemyCenter > player.x + player.width + dangerPadding;
  }));
  bursts.push({ x: player.x + player.width / 2, y: player.y + player.height / 2, ttl: 0.95, life: 0.95, radius: 18, color: 'rgba(255, 91, 91, 0.54)' });
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
