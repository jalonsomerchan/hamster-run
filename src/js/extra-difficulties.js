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

let observer = null;

function modeApi() {
  return window.HamsterRunModes;
}

function registerExtraDifficulties() {
  const api = modeApi();
  if (!api?.difficulties) return false;

  for (const difficulty of EXTRA_DIFFICULTIES) {
    if (!api.difficulties.some((item) => item.id === difficulty.id)) {
      api.difficulties.push(difficulty);
    }
  }

  api.refreshRecords?.();
  return true;
}

function renderMissingDifficultyCards() {
  const api = modeApi();
  const grid = document.querySelector('#difficultyGrid');
  if (!api || !grid) return;

  const selectedId = api.getSelectedDifficultyId?.();

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
  }
}

function syncExtraDifficulties() {
  if (!registerExtraDifficulties()) return;
  renderMissingDifficultyCards();
}

function observeMenu() {
  if (observer) return;

  observer = new MutationObserver(() => {
    window.requestAnimationFrame(syncExtraDifficulties);
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });
}

function installExtraDifficulties() {
  syncExtraDifficulties();
  observeMenu();
}

installExtraDifficulties();
