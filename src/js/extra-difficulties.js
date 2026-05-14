const EXTRA_DIFFICULTIES = [
  {
    id: 'extreme',
    name: 'Extremo',
    detail: 'Sin margen',
    tag: 'Máximo',
    difficultyBoost: 0.52,
    speedBoost: 52,
    enemyBoost: 0.26,
  },
  {
    id: 'impossible',
    name: 'Imposible',
    detail: 'Solo expertos',
    tag: 'Locura',
    difficultyBoost: 0.72,
    speedBoost: 72,
    enemyBoost: 0.38,
  },
];

let difficultyGridObserver = null;
let retryTimer = 0;
let syncQueued = false;

function modeApi() {
  return window.HamsterRunModes;
}

function registerExtraDifficulties() {
  const api = modeApi();
  if (!api?.difficulties) return false;

  let changed = false;
  for (const difficulty of EXTRA_DIFFICULTIES) {
    if (!api.difficulties.some((item) => item.id === difficulty.id)) {
      api.difficulties.push(difficulty);
      changed = true;
    }
  }

  if (changed) api.refreshRecords?.();
  return true;
}

function renderMissingDifficultyCards() {
  const api = modeApi();
  const grid = document.querySelector('#difficultyGrid');
  if (!api || !grid) return false;

  const selectedId = api.getSelectedDifficultyId?.();
  let changed = false;

  for (const difficulty of EXTRA_DIFFICULTIES) {
    if (grid.querySelector(`[data-difficulty="${difficulty.id}"]`)) continue;

    const selected = difficulty.id === selectedId;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'difficulty-card mode-card';
    button.dataset.difficulty = difficulty.id;
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-current', selected ? 'true' : 'false');
    button.setAttribute('aria-label', `${difficulty.name}. ${difficulty.detail}${selected ? ' Seleccionado.' : ''}`);
    button.innerHTML = `<span><strong>${difficulty.name}</strong>${difficulty.detail}</span><b>${difficulty.tag}</b>`;
    button.addEventListener('click', () => api.setSelectedDifficulty?.(difficulty.id, true));
    grid.append(button);
    changed = true;
  }

  return changed;
}

function syncExtraDifficulties() {
  syncQueued = false;
  if (!registerExtraDifficulties()) return false;
  return renderMissingDifficultyCards();
}

function queueSync() {
  if (syncQueued) return;
  syncQueued = true;
  window.requestAnimationFrame(syncExtraDifficulties);
}

function observeDifficultyGrid() {
  if (difficultyGridObserver) return;

  const grid = document.querySelector('#difficultyGrid');
  if (!grid) return;

  difficultyGridObserver = new MutationObserver(queueSync);
  difficultyGridObserver.observe(grid, { childList: true });
}

function retryUntilReady(attempt = 0) {
  window.clearTimeout(retryTimer);

  const ready = syncExtraDifficulties();
  observeDifficultyGrid();

  if (ready || attempt >= 12) return;
  retryTimer = window.setTimeout(() => retryUntilReady(attempt + 1), 120);
}

function installExtraDifficulties() {
  retryUntilReady();
  window.addEventListener('hamster-run-mode-change', queueSync, { passive: true });
}

installExtraDifficulties();
