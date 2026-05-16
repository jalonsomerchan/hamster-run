import { POWER_UP_TYPES, backgroundThemes } from '../config/gameConfig.js';
import { sprites } from '../config/assets.js';
import { clamp, random } from '../utils/math.js';
import {
  state,
  player,
  platforms,
  peanuts,
  hearts,
  enemies,
  decor,
  bursts,
  powerUps,
  backgroundProps,
  powerUpEffects,
  feedbacks,
} from './state.js';
import { selectedCharacter } from './player.js';

let ctx = null;
let heroCtx = null;
let heroPreview = null;
let homeOverlay = null;

export function initRenderer(canvasCtx, heroCanvas, heroContext, home) {
  ctx = canvasCtx;
  heroPreview = heroCanvas;
  heroCtx = heroContext;
  homeOverlay = home;
}

function drawSheetFrame(sprite, sx, sy, x, y, width, height) {
  ctx.drawImage(sprite.image, sx, sy, sprite.cell, sprite.cell, x, y, width, height);
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

function backgroundLaneY(lane, height, horizon, x) {
  if (lane === 'sky') {
    return state.height * 0.1 + Math.sin(x * 0.018) * 10;
  }
  if (lane === 'horizon') {
    return horizon - height + 42;
  }
  return state.height - height - 36;
}

function drawBackground(hill, sun) {
  const theme = backgroundThemes[state.level.backgroundSet] || backgroundThemes.meadow;
  const horizon = state.height * 0.62;

  const bgCanvas = ctx.canvas;
  const bgStyle = state.level.background
    ? `url(${state.level.background}) center / cover no-repeat`
    : `linear-gradient(180deg, ${theme.skyTop} 0%, ${theme.skyBottom} 62%, ${theme.ground} 62%, ${theme.ground} 100%)`;
  if (bgCanvas.style.background !== bgStyle) bgCanvas.style.background = bgStyle;

  if (state.level.background) {
    ctx.fillStyle = sun;
    for (let i = 0; i < 18; i += 1) {
      const x = (i * 91 - ((state.distance * 0.22) % 91)) % (state.width + 120);
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
    const x = (i * 91 - ((state.distance * 0.22) % 91)) % (state.width + 120);
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
  drawSheetFrame(
    sprites.peanut,
    sx,
    sy,
    peanut.x,
    peanut.y + bounce,
    peanut.size,
    peanut.size * 1.18,
  );
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
    drawSheetFrame(
      sprites.groundEnemy,
      sx,
      0,
      enemy.x - 6,
      enemy.y - 16,
      enemy.width + 16,
      enemy.height + 28,
    );
    return;
  }
  if (enemy.kind === 'chestnut') {
    const frame = Math.floor(state.time * 10 + enemy.phase) % 4;
    const sx = frame * sprites.chestnutEnemy.cell;
    drawSheetFrame(
      sprites.chestnutEnemy,
      sx,
      0,
      enemy.x - 7,
      enemy.y - 16,
      enemy.width + 18,
      enemy.height + 28,
    );
    return;
  }
  if (enemy.kind === 'mushroomHopper') {
    const frame = Math.floor(state.time * 8 + enemy.phase) % 4;
    const sx = frame * sprites.mushroomHopper.cell;
    drawSheetFrame(
      sprites.mushroomHopper,
      sx,
      0,
      enemy.x - 9,
      enemy.y - 18,
      enemy.width + 22,
      enemy.height + 30,
    );
    return;
  }
  if (enemy.kind === 'acornBat') {
    const frame = Math.floor(state.time * 12 + enemy.phase) % 4;
    const sx = frame * sprites.acornBat.cell;
    drawSheetFrame(
      sprites.acornBat,
      sx,
      0,
      enemy.x - 14,
      enemy.y - 17,
      enemy.width + 28,
      enemy.height + 34,
    );
    return;
  }
  if (enemy.kind === 'flying') {
    const frame = Math.floor(state.time * 11 + enemy.phase) % 4;
    const sx = frame * sprites.flyingEnemy.cell;
    drawSheetFrame(
      sprites.flyingEnemy,
      sx,
      0,
      enemy.x - 12,
      enemy.y - 15,
      enemy.width + 24,
      enemy.height + 30,
    );
    return;
  }
  const frame = Math.floor(state.time * 9) % 4;
  const sx = frame * sprites.enemy.cell;
  drawSheetFrame(
    sprites.enemy,
    sx,
    0,
    enemy.x - 5,
    enemy.y - 14,
    enemy.width + 18,
    enemy.height + 26,
  );
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
    drawSheetFrame(
      character.sprite,
      sx,
      0,
      player.x - 20,
      player.y - 32 + squash,
      player.width + 40,
      player.height + 46 - squash,
    );
    ctx.restore();
  }

  if (powerUpEffects.invincible > 0) {
    ctx.save();
    ctx.shadowColor = 'rgba(255, 216, 74, 0.82)';
    ctx.shadowBlur = 24;
    ctx.filter = `hue-rotate(${state.time * 180}deg) brightness(1.2)`;
    drawSheetFrame(
      character.sprite,
      sx,
      0,
      player.x - 17,
      player.y - 28 + squash,
      player.width + 34,
      player.height + 38 - squash,
    );
    ctx.restore();
  } else {
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
  const active = Object.entries(powerUpEffects).filter(([, time]) => time > 0);
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

function drawFeedbackItem(f) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - f.age / f.ttl);
  ctx.fillStyle = f.color;
  ctx.font = '900 16px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(f.text, f.x, f.y);
  ctx.restore();
}

function drawHeroPreview() {
  if (!homeOverlay?.classList.contains('is-visible')) {
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

export function draw() {
  const hill = state.level.palette[1];
  const sun = state.level.palette[2];

  ctx.save();
  ctx.clearRect(0, 0, state.width, state.height);
  if (state.shake > 0)
    ctx.translate(random(-state.shake, state.shake), random(-state.shake, state.shake));

  drawBackground(hill, sun);

  if (state.mode === 'running' || state.mode === 'over' || state.mode === 'paused') {
    decor.forEach((item) => {
      ctx.drawImage(sprites.grass, item.x, item.y, item.size, item.size);
    });
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
