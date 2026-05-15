import { PLATFORM_HEIGHT, LANDING_ZONE, START_SAFE_PLATFORMS, MOVING_PLATFORM_AMPLITUDE, TUTORIAL_POWER_UPS } from '../config/gameConfig.js';

import { random, clamp, lerpRange } from '../utils/math.js';
import { state, player, platforms, peanuts, hearts, enemies, decor, powerUps } from './state.js';
import {
  currentDifficulty, timeDifficultyRamp, highDifficultyPressure,
  laneY, closestLaneIndex, clampReachableGap,
  enemySafePlatformCount, enemySpawnChance, enemySpawnCount,
} from './difficulty.js';
import { spawnEnemy, spawnPowerUp, maybeSpawnPowerUp, spawnTutorialItems, spawnBackgroundProp } from './entities.js';

export function makePlatform(x, y, width, variant = 0) {
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

export function lastPlatformEnd() {
  return platforms.reduce((end, platform) => Math.max(end, platform.x + platform.width), 0);
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

export function chooseReachablePlatformY(previous, gap, difficulty) {
  const y = choosePlatformY(previous, gap, difficulty);
  if (!previous) return y;

  const previousY = previous.baseY ?? previous.y;
  const maxDelta = clamp(92 - gap * 0.12, 44, 86);
  return clamp(y, previousY - maxDelta, previousY + maxDelta);
}

export function maybeMakePlatformMoving(platform, difficulty) {
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

export function spawnPlatform(previous = platforms[platforms.length - 1]) {
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

export function improveStarterPlatforms() {
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

export function updateMovingPlatforms(dt, wasGrounded) {
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
