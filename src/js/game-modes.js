const MODE_KEY = 'hamster-run-selected-mode';
const MODE_RECORD_KEY = 'hamster-run-records-v1-by-mode-v1';
const LEGACY_RECORD_KEY = 'hamster-run-records-v1';
const LEVEL_IDS = ['meadow', 'clover', 'bridge', 'cookie', 'straw', 'moon'];
const STEPS = ['mode', 'character', 'level'];

const modes = [
  {
    id: 'endless',
    name: 'Endless',
    detail: 'Sin límite. Aguanta y suma.',
    tag: 'Clásico',
    timeLimit: null,
    seed: null,
  },
  {
    id: 'timeAttack',
    name: 'Contrarreloj',
    detail: '60 segundos. Máxima puntuación.',
    tag: '60s',
    timeLimit: 60,
    seed: null,
  },
  {
    id: 'challenge',
    name: 'Desafío',
    detail: 'Misma ruta. Mejor marca.',
    tag: 'Fijo',
    timeLimit: null,
    seed: 'hamster-run-daily-challenge-v1',
    difficultyBoost: 0.16,
  },
];

let selectedModeId = null;
let modeSelectorRenderedFor = '';
let currentStep = 'mode';
let menuWasVisible = false;
let characterChosenInFlow = false;

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

function resetFlowSelections() {
  selectedModeId = null;
  characterChosenInFlow = false;
  modeSelectorRenderedFor = '';
  renderModeSelector(true);
  clearButtonSelection(document.querySelector('#characterGrid'));
}

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function recordForLevel(levelId) {
  const modeId = selectedModeId || 'endless';
  const modeRecords = readJson(MODE_RECORD_KEY);
  const legacyRecords = readJson(LEGACY_RECORD_KEY);
  const modeRecord = modeRecords[`${modeId}:${levelId}`] || 0;

  if (modeId === 'endless') {
    return Math.max(modeRecord, legacyRecords[levelId] || 0);
  }

  return modeRecord;
}

function injectStepperStyles() {
  if (document.querySelector('#modeStepperStyles')) return;

  const style = document.createElement('style');
  style.id = 'modeStepperStyles';
  style.textContent = `
    .level-panel { gap: 0; }

    .selection-progress {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin: 14px 0 12px;
    }

    .selection-progress span {
      border-radius: 999px;
      background: rgba(56, 40, 22, 0.1);
      color: #74532b;
      font-size: 0.68rem;
      font-weight: 900;
      padding: 7px 8px;
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

    .selection-step { animation: stepIn 150ms ease-out; }

    @keyframes stepIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .selection-step-actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 14px;
    }

    #selectionNextButton,
    #startButton {
      display: none !important;
    }

    .mode-grid,
    .character-grid,
    .level-grid {
      scroll-padding: 12px;
      max-height: min(45dvh, 390px);
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-y;
      padding-right: 4px;
      padding-bottom: 8px;
    }

    .selection-step-help {
      margin: 10px 0 0;
      border-radius: 14px;
      background: rgba(95, 143, 67, 0.13);
      color: #5f4b2c;
      font-size: 0.82rem;
      font-weight: 750;
      line-height: 1.25;
      padding: 10px 12px;
    }

    @media (max-width: 430px) {
      .mode-grid,
      .character-grid {
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
  const menuScrollArea = document.querySelector('.menu-scroll-area');
  const characterSelect = document.querySelector('.character-select');

  if (!menuScrollArea || document.querySelector('#modeSelect')) return;

  const section = document.createElement('div');
  section.id = 'modeSelect';
  section.className = 'mode-select selection-step';
  section.dataset.step = 'mode';
  section.setAttribute('aria-label', 'Selector de modo de juego');
  section.innerHTML = `
    <p class="eyebrow">Modo</p>
    <div class="mode-grid" id="modeGrid"></div>
    <p class="selection-step-help">Elige un modo.</p>
  `;

  menuScrollArea.insertBefore(section, characterSelect || menuScrollArea.firstChild);
}

function ensureLevelSection() {
  const levelGrid = document.querySelector('#levelGrid');
  if (!levelGrid || levelGrid.closest('#levelSelect')) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'levelSelect';
  wrapper.className = 'level-select selection-step';
  wrapper.dataset.step = 'level';
  wrapper.setAttribute('aria-label', 'Selector de nivel');
  wrapper.innerHTML = `<p class="eyebrow">Nivel</p>`;
  levelGrid.parentNode.insertBefore(wrapper, levelGrid);
  wrapper.append(levelGrid);
}

function ensureStepStructure() {
  injectStepperStyles();
  ensureStepper();
  ensureModeSelector();
  ensureLevelSection();

  const characterSelect = document.querySelector('.character-select');
  const levelSelect = document.querySelector('#levelSelect');

  characterSelect?.classList.add('selection-step');
  characterSelect?.setAttribute('data-step', 'character');
  levelSelect?.classList.add('selection-step');
  levelSelect?.setAttribute('data-step', 'level');

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

  menu.addEventListener(
    'click',
    (event) => {
      const button = event.target.closest('button');
      if (!button || !menu.contains(button)) return;

      if (currentStep === 'character' && button.closest('#characterGrid')) {
        characterChosenInFlow = true;
        window.setTimeout(() => showStep('level', true), 0);
        return;
      }

      if (currentStep === 'level' && button.closest('#levelGrid')) {
        window.setTimeout(() => startSelectedLevel(), 35);
      }
    },
    true,
  );
}

function startSelectedLevel() {
  const startButton = document.querySelector('#startButton');
  if (!startButton) return;

  startButton.hidden = false;
  startButton.removeAttribute('inert');
  startButton.click();
  startButton.hidden = true;
  startButton.setAttribute('inert', '');
}

function renderModeSelector(force = false) {
  ensureStepStructure();

  const grid = document.querySelector('#modeGrid');
  if (!grid) return;

  const renderKey = `${selectedModeId || 'none'}:${modes.length}`;
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

function clearButtonSelection(container) {
  container?.querySelectorAll('button').forEach((button) => {
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-current', 'false');
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
  const backButton = document.querySelector('#selectionBackButton');

  const titles = {
    mode: 'Modo',
    character: 'Personaje',
    level: 'Ruta',
  };
  const descriptions = {
    mode: 'Selecciona el tipo de partida.',
    character: 'Elige tu corredor.',
    level: 'Toca una ruta para empezar.',
  };

  if (title) title.textContent = titles[step];
  if (copy) copy.textContent = descriptions[step];

  if (step === 'character' && !characterChosenInFlow) {
    clearButtonSelection(document.querySelector('#characterGrid'));
  }

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

  const grid = activeStep?.querySelector('.mode-grid, .character-grid, .level-grid');
  grid?.scrollTo?.({ top: 0, behavior: 'instant' });
}

function focusCurrentStep() {
  const activeStep = document.querySelector(`.selection-step[data-step="${currentStep}"]`);
  const selected = activeStep?.querySelector('[aria-pressed="true"]');
  const firstButton = activeStep?.querySelector('button');

  window.requestAnimationFrame(() => {
    (selected || firstButton)?.focus?.({ preventScroll: true });
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
    const observer = new MutationObserver(() => {
      const visible = !menu.hidden && menu.classList.contains('is-visible');

      window.requestAnimationFrame(() => {
        renderModeSelector();
        updateLevelRecordLabels();

        if (visible && !menuWasVisible) {
          resetFlowSelections();
          showStep('mode', true);
        }

        menuWasVisible = visible;
      });
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
