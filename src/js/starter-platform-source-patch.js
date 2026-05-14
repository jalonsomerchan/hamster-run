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
    'return clamp((state.distance - 450) / 3400, 0, 1) + timeDifficultyRamp().difficulty;',
  ],
  [
    'const chance = 0.075 + difficulty * 0.055;',
    'const chance = 0.075 + difficulty * 0.055 + timeDifficultyRamp().enemies;',
  ],
  [
    'const gap = random(level.gap[0], level.gap[1]);',
    'const ramp = timeDifficultyRamp();\n  const gap = random(level.gap[0] + ramp.gap * 0.45, level.gap[1] + ramp.gap);',
  ],
  [
    'const width = random(level.platform[0], level.platform[1]);',
    'const width = Math.max(120, random(level.platform[0], level.platform[1]) - ramp.platformShrink);',
  ],
  [
    'const y = pickLane(previous?.lane);',
    'const y = pickHarderLane(previous?.lane, ramp.vertical);',
  ],
  [
    'const scrollSpeed = (state.level.speed + (state.speedBoost || 0)) * dt;',
    'const scrollSpeed = (state.level.speed + timeDifficultyRamp().speed + (state.speedBoost || 0)) * dt;',
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

function pickHarderLane(previousLane, verticalBonus = 0) {
  const lane = pickLane(previousLane);
  if (verticalBonus <= 10 || Math.random() > clamp(verticalBonus / 130, 0, 0.72)) return lane;

  const lanes = laneY();
  const currentIndex = closestLaneIndex(lane);
  const direction = Math.random() < 0.5 ? -1 : 1;
  const extraSteps = verticalBonus > 62 && Math.random() < 0.5 ? 2 : 1;
  const nextIndex = clamp(currentIndex + direction * extraSteps, 0, lanes.length - 1);
  return lanes[nextIndex];
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
