const NativeBlob = window.Blob;

function patchHordeSource(source) {
  if (typeof source !== 'string' || !source.includes('function spawnPlatformWithPowerUps')) return source;
  if (source.includes('function applyModeEnemyFix')) return source;

  return source.replace(
    "const platform = platforms[platforms.length - 1];\n    maybeSpawnPowerUp(platform);",
    "const platform = platforms[platforms.length - 1];\n    applyModeEnemyFix(platform, enemyStart);\n    maybeSpawnPowerUp(platform);",
  ).replace(
    "originalSpawnPlatformWithPowerUps(previous);",
    "const enemyStart = enemies.length;\n    originalSpawnPlatformWithPowerUps(previous);",
  ).replace(
    "function maybeSpawnPowerUp(platform) {",
    `function activeModeId() {
  return selectedMode()?.id || 'endless';
}

function applyModeEnemyFix(platform, enemyStart) {
  if (!platform || state.level?.tutorial) return;
  const modeId = activeModeId();
  if (modeId === 'peaceful') {
    enemies.splice(enemyStart);
    return;
  }
  if (platform.index < (modeId === 'horde' ? 2 : START_SAFE_PLATFORMS)) return;
  if (modeId === 'horde') {
    ensureHordeEnemies(platform, enemyStart);
    return;
  }
  ensureNormalEnemyFloor(platform, enemyStart);
}

function ensureNormalEnemyFloor(platform, enemyStart) {
  if (enemies.length > enemyStart) return;
  const freeSpace = platform.width - LANDING_ZONE * 2;
  if (freeSpace <= 70) return;
  const chance = clamp((state.level?.enemyChance || 0.2) * 0.85, 0, 0.45);
  if (Math.random() > chance) return;
  const enemyX = platform.x + LANDING_ZONE + random(0, Math.max(8, freeSpace - 58));
  spawnEnemy(platform, enemyX, currentDifficulty());
}

function ensureHordeEnemies(platform, enemyStart) {
  const freeSpace = platform.width - LANDING_ZONE * 2;
  if (freeSpace <= 70) return;
  const maxBySpace = Math.max(1, Math.floor(freeSpace / 82));
  const existing = Math.max(0, enemies.length - enemyStart);
  const target = Math.min(maxBySpace, 2 + (Math.random() < 0.55 ? 1 : 0));
  const missing = Math.max(0, target - existing);
  for (let index = 0; index < missing; index += 1) {
    const slot = existing + index + 1;
    const ratio = slot / (target + 1);
    const enemyX = platform.x + LANDING_ZONE + clamp(freeSpace * ratio + random(-12, 12), 0, Math.max(8, freeSpace - 58));
    spawnEnemy(platform, enemyX, currentDifficulty() + 0.2 + index * 0.12);
  }
}

function maybeSpawnPowerUp(platform) {`,
  );
}

window.Blob = function HordeEnemyBlob(parts = [], options) {
  return new NativeBlob(parts.map((part) => patchHordeSource(part)), options);
};
window.setTimeout(() => {
  window.Blob = NativeBlob;
}, 1800);
