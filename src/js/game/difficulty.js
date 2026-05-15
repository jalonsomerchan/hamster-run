import { TIME_DIFFICULTY_CURVE } from '../config/difficultyCurve.js';
import { START_SAFE_PLATFORMS } from '../config/gameConfig.js';
import { clamp } from '../utils/math.js';
import { state } from './state.js';

export function selectedMode() {
  return state._currentGameMode || window.HamsterRunModes?.getSelectedMode?.() || { id: 'endless', name: 'Endless', timeLimit: null, seed: null };
}

export function selectedModeSpeedBoost() {
  return Math.max(0, selectedMode()?.speedBoost || 0);
}

export function currentDifficulty() {
  const base = clamp((state.distance - 450) / 3400, 0, 2.2) + timeDifficultyRamp().difficulty;
  return clamp(base + (selectedMode().difficultyBoost || 0), 0, 1);
}

export function timeDifficultyRamp(seconds = state.time || 0) {
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

export function highDifficultyPressure() {
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

export function enemyModeSettings() {
  const mode = selectedMode();
  const modeId = mode?.id || 'endless';
  return {
    modeId,
    disabled: modeId === 'peaceful',
    multiplier: modeId === 'horde' ? Math.max(2.8, mode?.enemySpawnMultiplier || 1) : 1,
    boost: Math.max(0, mode?.enemyBoost || 0),
  };
}

export function enemySafePlatformCount() {
  return enemyModeSettings().modeId === 'horde' ? 3 : START_SAFE_PLATFORMS;
}

export function enemySpawnChance(baseChance) {
  const settings = enemyModeSettings();
  if (settings.disabled) return 0;
  if (settings.modeId === 'horde') return clamp(0.78 + baseChance * 0.18 + settings.boost * 0.04, 0, 0.96);
  return clamp(baseChance + settings.boost * 0.04 + timeDifficultyRamp().enemies, 0, 0.72);
}

export function enemySpawnCount(chance, freeSpace) {
  const settings = enemyModeSettings();
  if (Math.random() > chance) return 0;
  const maxBySpace = Math.max(1, Math.floor(freeSpace / 92));
  if (settings.modeId !== 'horde') return 1;

  let count = Math.min(2, maxBySpace);
  if (maxBySpace > 2 && Math.random() < 0.46) count += 1;
  if (maxBySpace > 3 && Math.random() < 0.18) count += 1;
  return Math.min(count, maxBySpace, 4);
}

export function maxReachableDoubleJumpGap(previous, difficulty = 0) {
  const level = state.level || {};
  const gravity = Math.max(1, level.gravity || 1800);
  const jumpSpeed = Math.max(1, level.jump || 700);
  const speed = Math.max(1, (level.speed || 220) + timeDifficultyRamp().speed + selectedModeSpeedBoost() + (state.speedBoost || 0));
  const jumpWindow = clamp((jumpSpeed / gravity) * 2.05, 0.72, 1.08);
  const verticalPenalty = previous ? Math.abs((previous.baseY ?? previous.y) - laneY(closestLaneIndex(previous.baseY ?? previous.y))) * 0.18 : 0;
  const pressurePenalty = clamp(difficulty, 0, 2.4) * 10;
  return clamp(speed * jumpWindow - verticalPenalty - pressurePenalty, state.width * 0.32, state.width * 0.52);
}

export function clampReachableGap(rawGap, previous, difficulty = 0) {
  return Math.min(rawGap, maxReachableDoubleJumpGap(previous, difficulty));
}

export function laneY(index) {
  const lanes = state.level.lanes || [0.52, 0.64, 0.74];
  const clampedIndex = clamp(index, 0, lanes.length - 1);
  return state.height * lanes[clampedIndex];
}

export function closestLaneIndex(y) {
  const lanes = state.level.lanes || [0.52, 0.64, 0.74];
  let bestIndex = 0;
  let bestDistance = Infinity;
  lanes.forEach((lane, index) => {
    const distance = Math.abs(state.height * lane - y);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}
