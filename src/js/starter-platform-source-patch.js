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
    'return clamp((state.distance - 450) / 3400, 0, 4.5) + timeDifficultyRamp().difficulty;',
  ],
  [
    'const gap = tutorialSpec?.gap ?? random(gapRange[0], Math.min(gapRange[1], state.width * 0.46));',
    'const ramp = timeDifficultyRamp();\n  const pressure = highDifficultyPressure();\n  const gap = tutorialSpec?.gap ?? random(gapRange[0] + ramp.gap * 0.45 + pressure.gap * 0.5, Math.min(gapRange[1] + ramp.gap + pressure.gap, state.width * 0.72));',
  ],
  [
    'const minWidth = Math.max(widthRange[0], LANDING_ZONE * 2 + player.width);',
    'const minWidth = Math.max(widthRange[0] - ramp.platformShrink - pressure.platformShrink, LANDING_ZONE + player.width);',
  ],
  [
    'const maxWidth = Math.min(Math.max(widthRange[1], minWidth + 28), state.width * 0.94);',
    'const maxWidth = Math.min(Math.max(widthRange[1] - ramp.platformShrink - pressure.platformShrink, minWidth + 24), state.width * 0.94);',
  ],
  [
    'const y = tutorialSpec?.lane !== undefined ? laneY(tutorialSpec.lane) : choosePlatformY(previous, gap, difficulty);',
    'const y = tutorialSpec?.lane !== undefined ? laneY(tutorialSpec.lane) : choosePlatformY(previous, gap, difficulty + (ramp.vertical + pressure.vertical) / 130);',
  ],
  [
    'const enemyChance = platform.index < START_SAFE_PLATFORMS ? 0 : level.enemyChance * clamp(difficulty + 0.18, 0, 1);',
    'const enemyChance = platform.index < START_SAFE_PLATFORMS ? 0 : enemySpawnChance(level.enemyChance * clamp(difficulty + 0.18, 0, 4));',
  ],
  [
    'if (Math.random() < enemyChance && freeSpace > 62) {\n    const enemyX = platform.x + LANDING_ZONE + random(0, Math.max(8, freeSpace - 58));\n    spawnEnemy(platform, enemyX, difficulty);\n  }',
    'if (enemyChance > 0 && freeSpace > 62) {\n    const enemyCount = enemySpawnCount(enemyChance, freeSpace);\n    for (let enemyIndex = 0; enemyIndex < enemyCount; enemyIndex += 1) {\n      const laneRatio = (enemyIndex + 1) / (enemyCount + 1);\n      const jitter = random(-18, 18);\n      const enemyX = platform.x + LANDING_ZONE + clamp(freeSpace * laneRatio + jitter, 0, Math.max(8, freeSpace - 58));\n      spawnEnemy(platform, enemyX, difficulty + enemyIndex * 0.15);\n    }\n  }',
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
    gap: boost * 135 + speedBoost * 0.72,
    platformShrink: boost * 118 + speedBoost * 0.54,
    vertical: boost * 115 + enemyBoost * 130,
  };
}

function enemyModeSettings() {
  const mode = selectedMode();
  const modeId = mode?.id || 'endless';
  return {
    disabled: modeId === 'peaceful',
    multiplier: modeId === 'horde' ? Math.max(1, mode?.enemySpawnMultiplier || 1) : 1,
    boost: Math.max(0, mode?.enemyBoost || 0),
  };
}

function enemySpawnChance(baseChance) {
  const settings = enemyModeSettings();
  if (settings.disabled) return 0;
  return clamp((baseChance + settings.boost * 0.12 + timeDifficultyRamp().enemies) * settings.multiplier, 0, 0.98);
}

function enemySpawnCount(chance, freeSpace) {
  if (Math.random() > chance) return 0;
  const settings = enemyModeSettings();
  const maxBySpace = Math.max(1, Math.floor(freeSpace / 78));
  if (settings.multiplier <= 1) return 1;

  let count = 1;
  if (Math.random() < 0.7) count += 1;
  if (Math.random() < 0.45) count += 1;
  if (Math.random() < 0.24) count += 1;
  return Math.min(count, maxBySpace, 5);
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
