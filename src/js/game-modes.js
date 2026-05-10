const MODE_KEY = 'hamster-run-selected-mode';
const MODE_RECORD_KEY = 'hamster-run-records-v1-by-mode-v1';
const LEGACY_RECORD_KEY = 'hamster-run-records-v1';
const LEVEL_IDS = ['meadow', 'clover', 'bridge', 'cookie', 'straw', 'moon'];
const STEPS = ['mode', 'character', 'level'];

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
let modeSelectorRenderedFor = '';
let currentStep = 'mode';

function selectedMode() {
  return modes.find((mode) => mode.id === selectedModeId) || modes[0];
}

function setSelectedMode(modeId, advance = true) {
  if (!modes.some((mode) => mode.id === modeId)) return;
  selectedModeId = modeId;
  localStorage.setItem(MODE_KEY, selectedModeId);
  renderModeSelector(true);
  updateLevelRecordLabels();
  window.dispatchEvent(new CustomEvent('hamster-run-mode-change', { detail: selectedMode() }));

  if (advance) {
    showStep('character', true);
  }
}

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function recordForLevel(levelId) {
  const modeRecords = readJson(MODE_RECORD_KEY);
  const legacyRecords = readJson(LEGACY_RECORD_KEY);
  const modeRecord = modeRecords[`${selectedModeId}:${levelId}`] || 0;

  if (selectedModeId === 'endless') {
    return Math.max(modeRecord, legacyRecords[levelId] || 0);
  }

  return modeRecord;
}

function injectStepperStyles() {
  if (document.querySelector('#modeStepperStyles')) return;

  const style = document.createElement('style');
  style.id = 'modeStepperStyles';
  style.textContent = `
    .selection-progress {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin: 14px 0 8px;
    }

    .selection-progress span {
      border-radius: 999px;
      background: rgba(56, 40, 22, 0.1);
      color: #74532b;
      font-size: 0.68rem;
      font-weight: 900;
      padding: 6px 7px;
      text-align: center;
      text-transform: uppercase;
    }

    .selection-progress span[aria-current='step'] {
      background: #d9f0a7;
      color: #33511f;
      box-shadow: inset 0 0 0 2px rgba(95, 143, 67, 0.22);
    }

    .selection-step[hidden],
    #levelGrid[hidden],
    #startButton[hidden] {
      display: none !important;
    }

    .selection-step-actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 14px;
    }

    #selectionNextButton {
      display: none !important;
    }

    .mode-grid,
    .character-grid,
    .level-grid {
      scroll-padding: 12px;
    }

    .mode-grid,
    .level-grid {
      max-height: min(42dvh, 380px);
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-y;
      padding-right: 3px;
    }

    .character-grid {
      max-height: min(38dvh, 320px);
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-y;
      padding-right: 3px;
    }

    @media (max-width: 430px) {
      .mode-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.append(style);
}

function ensureStepper() {
  const levelPanel = document.querySelector('.level-panel');
  const heading = levelPanel?.querySelector('h2');

  if (!levelPanel || document.querySelector('#selectionProgress')) return;

  const progress = document.createElement('div');
  progress.id = 'selectionProgress';
  progress.className = 'selection-progress';
  progress.setAttribute('aria-label', 'Progreso de selección');
  progress.innerHTML = `
    <span data-step-indicator="mode">1. Modo</span>
    <span data-step-indicator="character">2. Personaje</span>
    <span data-step-indicator="level">3. Nivel</span>
  `;

  heading?.after(progress);
}

function ensureModeSelector() {
  const levelPanel = document.querySelector('.level-panel');
  const characterSelect = document.querySelector('.character-select');

  if (!levelPanel || document.querySelector('#modeSelect')) return;

  const section = document.createElement('div');
  section.id = 'modeSelect';
  section.className = 'mode-select selection-step';
  section.dataset.step = 'mode';
  section.setAttribute('aria-label', 'Selector de modo de juego');
  section.innerHTML = `
    <p class="eyebrow">Modo</p>
    <div class="mode-grid" id="modeGrid"></div>
  `;

  levelPanel.insertBefore(section, characterSelect || document.querySelector('#levelGrid'));
}

function ensureStepStructure() {
  injectStepperStyles();
  ensureStepper();
  ensureModeSelector();

  const characterSelect = document.querySelector('.character-select');
  const levelGrid = document.querySelector('#levelGrid');

  characterSelect?.classList.add('selection-step');
  characterSelect?.setAttribute('data-step', 'character');
  levelGrid?.classList.add('selection-step');
  levelGrid?.setAttribute('data-step', 'level');

  ensureStepActions();
  setupAutoAdvanceDelegation();
}

function ensureStepActions() {
  const levelPanel = document.querySelector('.level-panel');
  const startButton = document.querySelector('#startButton');

  if (!levelPanel || document.querySelector('#selectionStepActions')) return;

  const actions = document.createElement('div');
  actions.id = 'selectionStepActions';
  actions.className = 'selection-step-actions';
  actions.innerHTML = `
    <button id="selectionBackButton" class="ghost-button" type="button">Volver</button>
    <button id="selectionNextButton" class="primary-button" type="button" hidden>Continuar</button>
  `;

  levelPanel.insertBefore(actions, startButton);
  document.querySelector('#selectionBackButton')?.addEventListener('click', () => goStep(-1));
}

function setupAutoAdvanceDelegation() {
  const menu = document.querySelector('#menu');
  if (!menu || menu.dataset.autoAdvanceReady === 'true') return;

  menu.dataset.autoAdvanceReady = 'true';
  menu.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.closest('#modeGrid')) {
      return;
    }

    if (currentStep === 'character' && button.closest('#characterGrid')) {
      window.requestAnimationFrame(() => showStep('level', true));
    }
  });
}

function renderModeSelector(force = false) {
  ensureStepStructure();

  const grid = document.querySelector('#modeGrid');
  if (!grid) return;

  const renderKey = `${selectedModeId}:${modes.length}`;
  if (!force && modeSelectorRenderedFor === renderKey && grid.children.length === modes.length) return;

  modeSelectorRenderedFor = renderKey;
  grid.replaceChildren();
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
    button.addEventListener('click', () => setSelectedMode(mode.id, true));
    grid.append(button);
  }
}

function updateLevelRecordLabels() {
  const cards = [...document.querySelectorAll('#levelGrid .level-card')];
  const mode = selectedMode();

  cards.forEach((card, index) => {
    const levelId = LEVEL_IDS[index];
    const small = card.querySelector('small');

    if (!levelId || !small) return;

    const nextText = `Récord ${mode.name}: ${recordForLevel(levelId)}`;
    if (small.textContent !== nextText) {
      small.textContent = nextText;
    }
  });
}

function goStep(direction) {
  const index = Math.max(0, STEPS.indexOf(currentStep));
  const nextIndex = Math.max(0, Math.min(STEPS.length - 1, index + direction));
  showStep(STEPS[nextIndex], true);
}

function showStep(step, focus = false) {
  if (!STEPS.includes(step)) return;

  ensureStepStructure();
  currentStep = step;

  const levelPanel = document.querySelector('.level-panel');
  const title = levelPanel?.querySelector('h2');
  const copy = levelPanel?.querySelector('.copy');
  const startButton = document.querySelector('#startButton');
  const backButton = document.querySelector('#selectionBackButton');

  const titles = {
    mode: 'Elige modo',
    character: 'Elige personaje',
    level: 'Elige ruta',
  };
  const descriptions = {
    mode: 'Selecciona un modo para pasar al personaje.',
    character: 'Toca un personaje para continuar al nivel.',
    level: 'Elige el nivel y empieza la partida.',
  };

  if (title) title.textContent = titles[step];
  if (copy) copy.textContent = descriptions[step];

  document.querySelectorAll('.selection-step').forEach((section) => {
    const active = section.dataset.step === step;
    section.hidden = !active;
    section.toggleAttribute('inert', !active);
    section.setAttribute('aria-hidden', String(!active));
  });

  document.querySelectorAll('[data-step-indicator]').forEach((indicator) => {
    const active = indicator.dataset.stepIndicator === step;
    indicator.setAttribute('aria-current', active ? 'step' : 'false');
  });

  if (backButton) backButton.hidden = step === 'mode';
  if (startButton) {
    startButton.hidden = step !== 'level';
    startButton.toggleAttribute('inert', step !== 'level');
  }

  resetStepScroll();

  if (focus) {
    focusCurrentStep();
  }
}

function resetStepScroll() {
  const panel = document.querySelector('.level-panel');
  const activeStep = document.querySelector(`.selection-step[data-step="${currentStep}"]`);

  if (panel) panel.scrollTo({ top: 0, behavior: 'smooth' });
  activeStep?.scrollTo?.({ top: 0, behavior: 'instant' });

  const grid = activeStep?.matches('#levelGrid')
    ? activeStep
    : activeStep?.querySelector('.mode-grid, .character-grid, .level-grid');
  grid?.scrollTo?.({ top: 0, behavior: 'instant' });
}

function focusCurrentStep() {
  const activeStep = document.querySelector(`.selection-step[data-step="${currentStep}"]`);
  const selected = activeStep?.querySelector('[aria-pressed="true"]');
  const firstButton = activeStep?.querySelector('button');
  const startButton = document.querySelector('#startButton:not([hidden])');

  window.requestAnimationFrame(() => {
    (selected || firstButton || startButton)?.focus?.({ preventScroll: true });
  });
}

function setupModeKeyboard() {
  document.addEventListener('keydown', (event) => {
    const grid = document.querySelector('#modeGrid');
    if (!grid || !grid.contains(document.activeElement)) return;
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) return;

    const buttons = [...grid.querySelectorAll('button')];
    if (!buttons.length) return;

    if (event.key === 'Enter' || event.key === ' ') return;

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
  const menu = document.querySelector('#menu');

  if (menu) {
    const observer = new MutationObserver((mutations) => {
      const shouldSync = mutations.some((mutation) => mutation.type === 'attributes');

      if (shouldSync) {
        window.requestAnimationFrame(() => {
          renderModeSelector();
          updateLevelRecordLabels();

          if (!menu.hidden && menu.classList.contains('is-visible')) {
            showStep('mode', true);
          }
        });
      }
    });

    observer.observe(menu, { attributes: true, attributeFilter: ['hidden', 'class'] });
  }

  renderModeSelector(true);
  updateLevelRecordLabels();
  showStep('mode');
  setupModeKeyboard();
}

window.HamsterRunModes = {
  all: modes,
  getSelectedMode: selectedMode,
  getSelectedModeId: () => selectedMode().id,
  setSelectedMode,
  refreshRecords: updateLevelRecordLabels,
  showStep,
};

install();
