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
    .replace(/^import\s+(\w+)\s+from\s+'([^']+)';\s*$/gm, (match, name, specifier) =>
      Object.hasOwn(assetUrls, specifier) ? `const ${name} = ${JSON.stringify(assetUrls[specifier])};` : match,
    );
}

function patchSource(source) {
  let patched = source
    .replace(/function\s+resetGame\s*\(/g, 'function originalResetGame(')
    .replace(/function\s+spawnPlatform\s*\(/g, 'function originalSpawnPlatform(')
    .replace(/function\s+update\s*\(/g, 'function originalUpdate(')
    .replace(/function\s+draw\s*\(/g, 'function originalDraw(')
    .replace(/function\s+jump\s*\(/g, 'function originalJump(')
    .replace(/function\s+updateHud\s*\(/g, 'function originalUpdateHud(')
    .replace(/state\.lives\s*=\s*3;/g, 'state.lives = hamsterPowerUpMaxLivesForLevel(state.level);')
    .replace(/state\.lives\s*\+=\s*1;/g, 'state.lives = Math.min(hamsterPowerUpMaxLivesForLevel(state.level), state.lives + 1);')
    .replace(/state\.lives\s*<\s*5/g, 'state.lives < hamsterPowerUpMaxLivesForLevel(state.level)');

  if (!/function\s+itemBox\s*\(/.test(patched)) {
    patched += `\nfunction itemBox(item) {\n  const size = item.size || Math.max(item.width || 0, item.height || 0) || 28;\n  return { x: item.x, y: item.y, width: item.width || size, height: item.height || size };\n}\n`;
  }

  patched += `

const HAMSTER_POWER_UP_MAX_LIVES = {
  tutorial: 3,
  meadow: 4,
  clover: 4,
  bridge: 4,
  cookie: 5,
  straw: 5,
  moon: 5,
};

const HAMSTER_POWER_UP_TYPES = {
  jumps: { label: '+saltos', color: '#36a3ff', glow: 'rgba(54, 163, 255, 0.55)', duration: 9, radius: 17 },
  speed: { label: 'turbo', color: '#ff4d42', glow: 'rgba(255, 77, 66, 0.55)', duration: 7, radius: 17 },
  invincible: { label: 'invencible', color: '#ffd84a', glow: 'rgba(255, 216, 74, 0.65)', duration: 8, radius: 18 },
};

let hamsterPowerUps = [];
const hamsterActivePowerUps = { jumps: 0, speed: 0, invincible: 0 };
let hamsterExtraJumpAllowance = 0;

function hamsterPowerUpMaxLivesForLevel(level = state.level) {
  return Math.max(1, level?.maxLives ?? HAMSTER_POWER_UP_MAX_LIVES[level?.id] ?? 3);
}

function hamsterPowerUpClampLivesToLevel() {
  state.lives = Math.min(hamsterPowerUpMaxLivesForLevel(state.level), Math.max(0, state.lives));
}

function resetGame() {
  levels.forEach((level) => { level.maxLives = HAMSTER_POWER_UP_MAX_LIVES[level.id] ?? level.maxLives ?? 3; });
  hamsterPowerUps = [];
  hamsterActivePowerUps.jumps = 0;
  hamsterActivePowerUps.speed = 0;
  hamsterActivePowerUps.invincible = 0;
  hamsterExtraJumpAllowance = 0;
  originalResetGame();
  hamsterPowerUpClampLivesToLevel();
  updateHud();
}

function spawnPlatform(previous = platforms[platforms.length - 1]) {
  originalSpawnPlatform(previous);
  const platform = platforms[platforms.length - 1];
  hamsterPowerUpMaybeSpawn(platform);
}

function hamsterPowerUpMaybeSpawn(platform) {
  if (!platform || state.level?.tutorial) return;
  if (platform.index <= START_SAFE_PLATFORMS + 1 || platform.width < 175) return;
  const difficulty = typeof currentDifficulty === 'function' ? currentDifficulty() : 0;
  const chance = 0.075 + difficulty * 0.055;
  if (Math.random() > chance) return;
  const types = ['jumps', 'speed', 'invincible'];
  const type = types[Math.floor(random(0, types.length))];
  const yOffset = random(102, 138);
  hamsterPowerUps.push({
    type,
    x: platform.x + random(platform.width * 0.32, platform.width * 0.72),
    y: platform.y - yOffset,
    size: HAMSTER_POWER_UP_TYPES[type].radius * 2,
    yOffset,
    platformId: platform.id,
    bob: random(0, Math.PI * 2),
    taken: false,
  });
}

function jump() {
  if (state.mode !== 'running') return;
  const before = player.jumps;
  originalJump();
  const maxJumps = 2 + hamsterExtraJumpAllowance;
  if (player.jumps === before && player.jumps < maxJumps) {
    player.vy = -state.level.jump;
    player.jumps += 1;
    player.grounded = false;
  }
}

function update(dt) {
  originalUpdate(dt);
  hamsterPowerUpUpdate(dt);
}

function hamsterPowerUpUpdate(dt) {
  if (state.mode !== 'running') return;

  hamsterActivePowerUps.jumps = Math.max(0, hamsterActivePowerUps.jumps - dt);
  hamsterActivePowerUps.speed = Math.max(0, hamsterActivePowerUps.speed - dt);
  hamsterActivePowerUps.invincible = Math.max(0, hamsterActivePowerUps.invincible - dt);
  hamsterExtraJumpAllowance = hamsterActivePowerUps.jumps > 0 ? 2 : 0;

  if (hamsterActivePowerUps.speed > 0) state.speedBoost = Math.max(state.speedBoost || 0, 6.5);
  if (hamsterActivePowerUps.invincible > 0) state.invincible = Math.max(state.invincible || 0, hamsterActivePowerUps.invincible);

  for (const powerUp of hamsterPowerUps) {
    const platform = platforms.find((candidate) => candidate.id === powerUp.platformId);
    if (platform) powerUp.y = platform.y - powerUp.yOffset;
    powerUp.x -= (state.level.speed + (state.speedBoost || 0)) * dt;
    powerUp.bob += dt * 5;
  }

  const playerHitbox = hamsterPowerUpPlayerBox(7);
  for (const powerUp of hamsterPowerUps) {
    if (powerUp.taken || !hamsterPowerUpBoxesOverlap(playerHitbox, itemBox(powerUp))) continue;
    hamsterPowerUpCollect(powerUp);
  }

  hamsterPowerUps = hamsterPowerUps.filter((powerUp) => powerUp.x > -80 && !powerUp.taken);
  hamsterPowerUpClampLivesToLevel();
}

function hamsterPowerUpCollect(powerUp) {
  powerUp.taken = true;
  const spec = HAMSTER_POWER_UP_TYPES[powerUp.type];
  hamsterActivePowerUps[powerUp.type] = Math.max(hamsterActivePowerUps[powerUp.type], spec.duration);
  if (powerUp.type === 'jumps') hamsterExtraJumpAllowance = 2;
  if (powerUp.type === 'speed') state.speedBoost = Math.max(state.speedBoost || 0, 6.5);
  if (powerUp.type === 'invincible') state.invincible = Math.max(state.invincible || 0, spec.duration);
  bursts.push({ x: powerUp.x + powerUp.size / 2, y: powerUp.y + powerUp.size / 2, ttl: 0.45, life: 0.45, radius: 32, color: spec.glow });
  window.HamsterRunAudio?.play?.('peanut');
  updateHud();
}

function draw() {
  originalDraw();
  hamsterPowerUpDrawItems();
  hamsterPowerUpDrawTimers();
}

function hamsterPowerUpDrawItems() {
  for (const powerUp of hamsterPowerUps) {
    if (powerUp.taken) continue;
    const spec = HAMSTER_POWER_UP_TYPES[powerUp.type];
    const radius = powerUp.size / 2;
    const cx = powerUp.x + radius;
    const cy = powerUp.y + radius + Math.sin(powerUp.bob) * 5;
    ctx.save();
    ctx.shadowColor = spec.glow;
    ctx.shadowBlur = 18;
    ctx.fillStyle = spec.color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = '700 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(powerUp.type === 'jumps' ? '↟' : powerUp.type === 'speed' ? '»' : '★', cx, cy + 1);
    ctx.restore();
  }
}

function hamsterPowerUpDrawTimers() {
  const active = Object.entries(hamsterActivePowerUps).filter(([, time]) => time > 0);
  if (!active.length || state.mode !== 'running') return;
  const startY = 92;
  ctx.save();
  ctx.font = '800 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  active.forEach(([type, time], index) => {
    const spec = HAMSTER_POWER_UP_TYPES[type];
    const text = spec.label + ' ' + Math.ceil(time) + 's';
    const x = state.width / 2;
    const y = startY + index * 30;
    const width = Math.max(104, ctx.measureText(text).width + 28);
    ctx.fillStyle = 'rgba(31, 28, 35, 0.58)';
    hamsterPowerUpRoundRect(x - width / 2, y - 13, width, 25, 13);
    ctx.fill();
    ctx.fillStyle = spec.color;
    ctx.fillText(text, x, y + 1);
  });
  ctx.restore();
}

function updateHud() {
  hamsterPowerUpClampLivesToLevel();
  originalUpdateHud();
  hamsterPowerUpRenderLifeHearts();
}

function hamsterPowerUpRenderLifeHearts() {
  if (!livesEl) return;
  const lives = Math.max(0, Math.floor(state.lives));
  const maxLives = hamsterPowerUpMaxLivesForLevel(state.level);
  livesEl.textContent = '♥'.repeat(lives) + '♡'.repeat(Math.max(0, maxLives - lives));
  livesEl.setAttribute('aria-label', lives + ' de ' + maxLives + (maxLives === 1 ? ' vida' : ' vidas'));
}

function hamsterPowerUpPlayerBox(padding = 0) {
  if (typeof playerBox === 'function') return playerBox(padding);
  return { x: player.x + padding, y: player.y + padding, width: player.width - padding * 2, height: player.height - padding * 2 };
}

function hamsterPowerUpBoxesOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function hamsterPowerUpRoundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

levels.forEach((level) => { level.maxLives = HAMSTER_POWER_UP_MAX_LIVES[level.id] ?? level.maxLives ?? 3; });
updateHud();
`;

  return patched;
}

const patchedSource = patchSource(inlineImports(appSource));
const patchedModuleUrl = URL.createObjectURL(new Blob([patchedSource], { type: 'text/javascript' }));

import(patchedModuleUrl)
  .catch((error) => console.error('No se pudo cargar Hamster Run', error))
  .finally(() => URL.revokeObjectURL(patchedModuleUrl));
