const MODE_KEY = 'hamster-run-selected-mode';

const modes = [
  {
    id: 'endless',
    name: 'Endless',
    detail: 'Corre todo lo que puedas. El modo clásico principal.',
    tag: 'Clásico',
    timeLimit: null,
    seed: null,
  },
  {
    id: 'timeAttack',
    name: 'Contrarreloj',
    detail: 'Tienes 60 segundos para lograr la mayor puntuación.',
    tag: '60s',
    timeLimit: 60,
    seed: null,
  },
  {
    id: 'challenge',
    name: 'Desafío',
    detail: 'Ruta reproducible con semilla fija para comparar marcas.',
    tag: 'Fijo',
    timeLimit: null,
    seed: 'hamster-run-daily-challenge-v1',
    difficultyBoost: 0.16,
  },
];

let selectedModeId = localStorage.getItem(MODE_KEY) || 'endless';

function selectedMode() {
  return modes.find((mode) => mode.id === selectedModeId) || modes[0];
}

function setSelectedMode(modeId) {
  if (!modes.some((mode) => mode.id === modeId)) return;
  selectedModeId = modeId;
  localStorage.setItem(MODE_KEY, selectedModeId);
  renderModeSelector();
  window.dispatchEvent(new CustomEvent('hamster-run-mode-change', { detail: selectedMode() }));
}

function ensureModeSelector() {
  const levelPanel = document.querySelector('.level-panel');
  const characterSelect = document.querySelector('.character-select');

  if (!levelPanel || document.querySelector('#modeSelect')) return;

  const section = document.createElement('div');
  section.id = 'modeSelect';
  section.className = 'mode-select';
  section.setAttribute('aria-label', 'Selector de modo de juego');
  section.innerHTML = `
    <p class="eyebrow">Modo</p>
    <div class="mode-grid" id="modeGrid"></div>
  `;

  levelPanel.insertBefore(section, characterSelect || document.querySelector('#levelGrid'));
}

function renderModeSelector() {
  ensureModeSelector();

  const grid = document.querySelector('#modeGrid');
  if (!grid) return;

  grid.innerHTML = '';
  grid.setAttribute('role', 'group');
  grid.setAttribute('aria-label', 'Selector de modo de juego');

  for (const mode of modes) {
    const button = document.createElement('button');
    const selected = mode.id === selectedModeId;

    button.type = 'button';
    button.className = 'mode-card';
    button.dataset.mode = mode.id;
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-current', selected ? 'true' : 'false');
    button.setAttribute('aria-label', `${mode.name}. ${mode.detail}${selected ? ' Seleccionado.' : ''}`);
    button.innerHTML = `
      <span><strong>${mode.name}</strong>${mode.detail}</span>
      <b>${mode.tag}</b>
    `;
    button.addEventListener('click', () => setSelectedMode(mode.id));
    grid.append(button);
  }
}

function setupModeKeyboard() {
  document.addEventListener('keydown', (event) => {
    const grid = document.querySelector('#modeGrid');
    if (!grid || !grid.contains(document.activeElement)) return;
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;

    const buttons = [...grid.querySelectorAll('button')];
    if (!buttons.length) return;

    event.preventDefault();
    const index = Math.max(0, buttons.indexOf(document.activeElement));
    let nextIndex = index;

    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = buttons.length - 1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % buttons.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + buttons.length) % buttons.length;

    buttons[nextIndex].focus({ preventScroll: true });
  });
}

function install() {
  const observer = new MutationObserver(renderModeSelector);
  const menu = document.querySelector('#menu');

  if (menu) {
    observer.observe(menu, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
  }

  renderModeSelector();
  setupModeKeyboard();
}

window.HamsterRunModes = {
  all: modes,
  getSelectedMode: selectedMode,
  getSelectedModeId: () => selectedMode().id,
  setSelectedMode,
};

install();
