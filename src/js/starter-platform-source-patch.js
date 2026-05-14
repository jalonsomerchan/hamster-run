import { TIME_DIFFICULTY_CURVE } from './config/difficultyCurve.js';

const STARTER_PLATFORM_SOURCE_PATCHES = [
  [
    "makePlatform(-35, floor, Math.max(340, state.width * 0.82), state.level.platformVariant),",
    "makePlatform(-45, floor, Math.max(390, state.width * 0.96), state.level.platformVariant),",
  ],
  [
    'if (state.level?.tutorial || platforms.length < 2) return;',
    'if (platforms.length < 2) return;',
  ],
  [
    'first.x = -34;',
    'first.x = -45;',
  ],
  [
    'first.width = clamp(state.width * 0.74, 292, 348);',
    'first.width = clamp(state.width * 0.86, 330, 420);',
  ],
  [
    'return clamp((state.distance - 450) / 3400, 0, 1);',
    'return clamp((state.distance - 450) / 3400, 0, 2.2) + timeDifficultyRamp().difficulty;',
  ],
  [
    'const gap = tutorialSpec?.gap ?? random(gapRange[0], Math.min(gapRange[1], state.width * 0.46));',
    'const ramp = timeDifficultyRamp();\n  const pressure = highDifficultyPressure();\n  const rawGap = random(gapRange[0] + ramp.gap * 0.32 + pressure.gap * 0.34, Math.min(gapRange[1] + ramp.gap + pressure.gap, state.width * 0.54));\n  const gap = tutorialSpec?.gap ?? clampReachableGap(rawGap, previous, difficulty);',
  ],
  [
    'const minWidth = Math.max(widthRange[0], LANDING_ZONE * 2 + player.width);',
    'const minWidth = Math.max(widthRange[0] - ramp.platformShrink - pressure.platformShrink, LANDING_ZONE * 1.35 + player.width);',
  ],
  [
    'const maxWidth = Math.min(Math.max(widthRange[1], minWidth + 28), state.width * 0.94);',
    'const maxWidth = Math.min(Math.max(widthRange[1] - ramp.platformShrink - pressure.platformShrink, minWidth + 34), state.width * 0.94);',
  ],
  [
    'const y = tutorialSpec?.lane !== undefined ? laneY(tutorialSpec.lane) : choosePlatformY(previous, gap, difficulty);',
    'const y = tutorialSpec?.lane !== undefined ? laneY(tutorialSpec.lane) : chooseReachablePlatformY(previous, gap, difficulty + (ramp.vertical + pressure.vertical) / 170);',
  ],
  [
    'const enemyChance = platform.index < START_SAFE_PLATFORMS ? 0 : level.enemyChance * clamp(difficulty + 0.18, 0, 1);',
    'const enemyChance = platform.index < enemySafePlatformCount() ? 0 : enemySpawnChance(level.enemyChance * clamp(difficulty + 0.18, 0, 2.2));',
  ],
  [
    'if (Math.random() < enemyChance && freeSpace > 62) {\n    const enemyX = platform.x + LANDING_ZONE + random(0, Math.max(8, freeSpace - 58));\n    spawnEnemy(platform, enemyX, difficulty);\n  }',
    'if (enemyChance > 0 && freeSpace > 62) {\n    const enemyCount = enemySpawnCount(enemyChance, freeSpace);\n    for (let enemyIndex = 0; enemyIndex < enemyCount; enemyIndex += 1) {\n      const laneRatio = (enemyIndex + 1) / (enemyCount + 1);\n      const jitter = random(-14, 14);\n      const enemyX = platform.x + LANDING_ZONE + clamp(freeSpace * laneRatio + jitter, 0, Math.max(8, freeSpace - 58));\n      spawnEnemy(platform, enemyX, difficulty + enemyIndex * 0.12);\n    }\n  }',
  ],
  [
    'const scrollSpeed = (state.level.speed + (state.speedBoost || 0)) * dt;',
    'const scrollSpeed = (state.level.speed + timeDifficultyRamp().speed + selectedModeSpeedBoost() + (state.speedBoost || 0)) * dt;',
  ],
  [
    'const scrollSpeed = ((state.level?.speed || 0) + (state.speedBoost || 0)) * dt;',
    'const scrollSpeed = ((state.level?.speed || 0) + timeDifficultyRamp().speed + selectedModeSpeedBoost() + (state.speedBoost || 0)) * dt;',
  ],
];

const TIME_DIFFICULTY_SOURCE = `
const TIME_DIFFICULTY_CURVE = ${JSON.stringify(TIME_DIFFICULTY_CURVE)};

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

function selectedModeSpeedBoost() {
  return Math.max(0, selectedMode()?.speedBoost || 0);
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
`;

const PAUSE_CONTROLS_SOURCE = `
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
`;

const nativeBlob = window.Blob;
let restored = false;

function patchGameSource(source) {
  if (typeof source !== 'string' || !source.includes('Hamster Run')) return source;

  const patchedSource = STARTER_PLATFORM_SOURCE_PATCHES.reduce(
    (nextSource, [from, to]) => nextSource.split(from).join(to),
    source,
  );

  const needsPauseControls =
    !patchedSource.includes('window.HamsterRunPauseControls') &&
    patchedSource.includes('function syncGameChrome') &&
    patchedSource.includes('function resetGame');
  const needsTimeDifficulty =
    !patchedSource.includes('function timeDifficultyRamp') &&
    patchedSource.includes('function currentDifficulty');

  return `${needsTimeDifficulty ? TIME_DIFFICULTY_SOURCE : ''}${patchedSource}${
    needsPauseControls ? `\n${PAUSE_CONTROLS_SOURCE}` : ''
  }`;
}

function shouldPatchBlob(parts) {
  return parts?.some?.((part) => typeof part === 'string' && part.includes('function improveStarterPlatforms'));
}

function installBlobPatch() {
  if (typeof nativeBlob !== 'function') return;

  window.Blob = function PatchedBlob(parts = [], options) {
    const nextParts = shouldPatchBlob(parts) ? parts.map(patchGameSource) : parts;
    return new nativeBlob(nextParts, options);
  };
  window.Blob.prototype = nativeBlob.prototype;
}

function restoreSourcePatches() {
  if (restored) return;

  restored = true;
  window.Blob = nativeBlob;
}

installBlobPatch();
window.setTimeout(restoreSourcePatches, 1200);
