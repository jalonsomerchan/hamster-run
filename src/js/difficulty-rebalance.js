const DIFFICULTY_OVERRIDES = {
  hard: {
    detail: 'Exigente pero justo',
    difficultyBoost: 0.34,
    speedBoost: 42,
    enemyBoost: 0.16,
  },
  veryHard: {
    detail: 'Poco margen',
    difficultyBoost: 0.56,
    speedBoost: 68,
    enemyBoost: 0.24,
  },
};

const MODE_OVERRIDES = {
  challenge: {
    difficultyBoost: 0.08,
  },
  horde: {
    detail: 'Muchos enemigos',
    difficultyBoost: 0.18,
    speedBoost: 24,
    enemyBoost: 0.54,
    enemySpawnMultiplier: 3.8,
  },
};

let syncQueued = false;
let retryTimer = 0;

function modeApi() {
  return window.HamsterRunModes;
}

function applyOverrides() {
  const api = modeApi();
  if (!api?.all || !api?.difficulties) return false;

  for (const mode of api.all) {
    const override = MODE_OVERRIDES[mode.id];
    if (override) Object.assign(mode, override);
  }

  for (const difficulty of api.difficulties) {
    const override = DIFFICULTY_OVERRIDES[difficulty.id];
    if (override) Object.assign(difficulty, override);
  }

  api.refreshRecords?.();
  window.dispatchEvent(new CustomEvent('hamster-run-mode-change', { detail: api.getSelectedMode?.() }));
  return true;
}

function queueApplyOverrides() {
  if (syncQueued) return;
  syncQueued = true;
  window.requestAnimationFrame(() => {
    syncQueued = false;
    applyOverrides();
  });
}

function retryUntilReady(attempt = 0) {
  window.clearTimeout(retryTimer);
  if (applyOverrides() || attempt >= 12) return;
  retryTimer = window.setTimeout(() => retryUntilReady(attempt + 1), 120);
}

retryUntilReady();
window.addEventListener('hamster-run-mode-change', queueApplyOverrides, { passive: true });
