const EXTRA_DIFFICULTIES = [
  {
    id: 'extreme',
    name: 'Extremo',
    detail: 'Sin margen real',
    tag: 'Máximo',
    difficultyBoost: 1.08,
    speedBoost: 142,
    enemyBoost: 0.52,
  },
  {
    id: 'impossible',
    name: 'Imposible',
    detail: 'Brutal desde el inicio',
    tag: 'Locura',
    difficultyBoost: 1.55,
    speedBoost: 210,
    enemyBoost: 0.78,
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
    const current = api.difficulties.find((item) => item.id === difficulty.id);
    if (current) {
      Object.assign(current, difficulty);
      changed = true;
      continue;
    }

    api.difficulties.push(difficulty);
    changed = true;
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
    const existingButton = grid.querySelector(`[data-difficulty="${difficulty.id}"]`);
    const selected = difficulty.id === selectedId;

    if (existingButton) {
      existingButton.setAttribute('aria-label', `${difficulty.name}. ${difficulty.detail}${selected ? ' Seleccionado.' : ''}`);
      existingButton.innerHTML = `<span><strong>${difficulty.name}</strong>${difficulty.detail}</span><b>${difficulty.tag}</b>`;
      continue;
    }

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
