import appSource from './app.js?raw';
import '../css/main.css';

import hamsterSheet from '../assets/sprites/hamster/sheet-transparent.png';
import blueHamsterSheet from '../assets/sprites/characters/blue-hamster/sheet-transparent.png';
import tasmanianSheet from '../assets/sprites/characters/tasmanian/sheet-transparent.png';
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
    .replace(/^import\s+(\w+)\s+from\s+'([^']+)';\s*$/gm, (match, name, specifier) => {
      return Object.hasOwn(assetUrls, specifier) ? `const ${name} = ${JSON.stringify(assetUrls[specifier])};` : match;
    });
}

function patchSource(source) {
  let patched = source
    .replace(/function\s+canStomp\s*\(/g, 'function originalCanStomp(')
    .replace(/function\s+stompEnemy\s*\(/g, 'function originalStompEnemy(')
    .replace(/function\s+loseLife\s*\(/g, 'function originalLoseLife(')
    .replace(/function\s+respawnPlayerAfterLifeLoss\s*\(/g, 'function originalRespawnPlayerAfterLifeLoss(');

  if (!/function\s+itemBox\s*\(/.test(patched)) {
    patched += `\nfunction itemBox(item) {\n  const size = item.size || Math.max(item.width || 0, item.height || 0) || 28;\n  return { x: item.x, y: item.y, width: item.width || size, height: item.height || size };\n}\n`;
  }

  patched += `

const lifeGhosts = [];
const perfProbe = { enabled: new URLSearchParams(window.location.search).has('debugFps'), frames: 0, acc: 0 };

function canStomp(enemy, previousBottom) {
  if (!enemy || enemy.kind === 'thistle') return false;
  const box = enemyBox(enemy);
  const playerCenterX = player.x + player.width / 2;
  return playerCenterX >= box.x + 4 &&
    playerCenterX <= box.x + box.width - 4 &&
    previousBottom <= box.y + Math.min(24, box.height * 0.55) &&
    (player.vy >= -80 || previousBottom <= box.y + 10);
}

function stompEnemy(enemy) {
  if (!enemy || enemy.defeated) return;
  enemy.defeated = true;
  enemy.defeatTime = 0.28;
  state.score += enemy.kind === 'flying' ? 180 : 140;
  player.vy = -state.level.jump * 0.46;
  player.jumps = 1;
  player.grounded = false;
  bursts.push({ x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2, ttl: 0.34, life: 0.34, radius: Math.max(enemy.width, enemy.height) * 0.55, color: 'rgba(255, 232, 120, 0.65)' });
}

function loseLife() {
  if (state.mode !== 'running' || state.invincible > 0) return;
  spawnLifeGhost();
  state.lives = Math.max(0, state.lives - 1);
  state.invincible = 2.65;
  state.shake = Math.max(state.shake, 2.2);
  updateHud();
  bursts.push({ x: clamp(player.x + player.width / 2, 20, state.width - 20), y: clamp(player.y + player.height / 2, 70, state.height - 90), ttl: 0.72, life: 0.72, radius: 28, color: 'rgba(255, 65, 85, 0.74)' });
  if (state.lives <= 0) { endGame(); return; }
  respawnPlayerAfterLifeLoss();
}

function spawnLifeGhost() {
  const character = selectedCharacter();
  const sprite = character.sprite;
  lifeGhosts.push({
    x: clamp(player.x, 16, state.width - player.width - 16),
    y: clamp(player.y, 84, state.height - player.height - 96),
    width: player.width,
    height: player.height,
    sprite,
    frame: Math.floor(state.time * 10) % sprite.cols,
    age: 0,
    ttl: 1.9,
    drift: Math.random() < 0.5 ? -10 : 10,
  });
  if (lifeGhosts.length > 5) lifeGhosts.splice(0, lifeGhosts.length - 5);
}

function respawnPlayerAfterLifeLoss() {
  const safePlatform = platforms.find((platform) => platform.x <= player.x && platform.x + platform.width >= player.x + player.width) ||
    platforms.find((platform) => platform.x + platform.width > player.x + player.width) || platforms[0];
  if (!safePlatform) { endGame(); return; }
  player.x = clamp(player.x, safePlatform.x + 30, safePlatform.x + safePlatform.width - player.width - 30);
  player.y = safePlatform.y - player.height - 18;
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
update = function updateWithLifePatches(dt) {
  originalUpdate(dt);
  updateLifeGhosts(dt);
  cleanupLongRunEntities();
  updatePerfProbe(dt);
};

const originalDrawPlayer = drawPlayer;
drawPlayer = function drawPlayerWithGhosts() {
  originalDrawPlayer();
  drawLifeGhosts();
};

const originalUpdateHud = updateHud;
updateHud = function updateHudWithHeartIcons() {
  originalUpdateHud();
  renderLifeHearts();
};

function updateLifeGhosts(dt) {
  for (let index = lifeGhosts.length - 1; index >= 0; index -= 1) {
    const ghost = lifeGhosts[index];
    ghost.age += dt;
    ghost.y -= 84 * dt;
    ghost.x += ghost.drift * dt;
    if (ghost.age >= ghost.ttl) lifeGhosts.splice(index, 1);
  }
}

function drawLifeGhosts() {
  for (const ghost of lifeGhosts) {
    const progress = clamp(ghost.age / ghost.ttl, 0, 1);
    const sprite = ghost.sprite;
    const cell = sprite.cell;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 0.78 * (1 - progress));
    ctx.translate(ghost.x + ghost.width / 2, ghost.y + ghost.height / 2 - Math.sin(progress * Math.PI) * 12);
    ctx.scale(1 + progress * 0.18, 1 + progress * 0.18);
    ctx.filter = 'brightness(1.35) saturate(0.65)';
    ctx.drawImage(sprite.image, ghost.frame * cell, 0, cell, cell, -ghost.width / 2, -ghost.height / 2, ghost.width, ghost.height);
    ctx.filter = 'none';
    ctx.strokeStyle = 'rgba(255, 248, 180, 0.95)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -ghost.height * 0.64, ghost.width * 0.41, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
    ctx.beginPath();
    ctx.arc(-ghost.width * 0.28, -ghost.height * 0.2, 5 + progress * 5, 0, Math.PI * 2);
    ctx.arc(ghost.width * 0.28, -ghost.height * 0.2, 5 + progress * 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

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
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 340) event.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
  canvas.addEventListener('pointerdown', (event) => {
    if (event.target.closest?.(interactiveSelector) || state.mode !== 'running') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    canvas.setPointerCapture?.(event.pointerId);
    jump();
  }, { passive: false, capture: true });
  window.addEventListener('keydown', (event) => {
    if ((event.code === 'Space' || event.code === 'ArrowUp') && state.mode === 'running') event.preventDefault();
  }, { passive: false, capture: true });
}

function renderLifeHearts() {
  if (!livesEl) return;
  const visibleLives = Math.max(0, Math.floor(state.lives));
  livesEl.textContent = '♥'.repeat(visibleLives);
  livesEl.style.backgroundImage = 'none';
  livesEl.style.width = 'auto';
  livesEl.setAttribute('aria-label', visibleLives === 1 ? '1 vida' : visibleLives + ' vidas');
}

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
