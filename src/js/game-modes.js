const MODE_KEY = 'hamster-run-selected-mode';
const DIFFICULTY_KEY = 'hamster-run-selected-difficulty';
const MODE_RECORD_KEY = 'hamster-run-records-v1-by-mode-v1';
const LEGACY_RECORD_KEY = 'hamster-run-records-v1';
const LEVEL_IDS = ['tutorial', 'meadow', 'clover', 'bridge', 'cookie', 'straw', 'moon'];
const STEPS = ['mode', 'difficulty', 'character', 'level'];

const modes = [
  { id: 'endless', name: 'Endless', detail: 'Libre', tag: 'Clásico', timeLimit: null, seed: null },
  { id: 'timeAttack', name: 'Contrarreloj', detail: '60 s', tag: '60s', timeLimit: 60, seed: null },
  { id: 'challenge', name: 'Desafío', detail: 'Fijo', tag: 'Fijo', timeLimit: null, seed: 'hamster-run-daily-challenge-v1', difficultyBoost: 0.08 },
  { id: 'peaceful', name: 'Paseo tranquilo', detail: 'Sin enemigos', tag: 'Relax', timeLimit: null, seed: null, enemySpawnMultiplier: 0, disableEnemies: true },
  { id: 'horde', name: 'Plaga de zorros', detail: 'Invasión total', tag: 'HORDA', timeLimit: null, seed: null, difficultyBoost: 0.42, speedBoost: 38, enemyBoost: 0.95, enemySpawnMultiplier: 18.0 },
];

const difficulties = [
  { id: 'tutorial', name: 'Tutorial', detail: 'Aprender sin presión', tag: 'Guía', difficultyBoost: -0.22, speedBoost: -16, enemyBoost: -0.18 },
  { id: 'basic', name: 'Básico', detail: 'Inicio cómodo', tag: 'Fácil', difficultyBoost: -0.1, speedBoost: -8, enemyBoost: -0.08 },
  { id: 'medium', name: 'Medio', detail: 'Ritmo normal', tag: 'Normal', difficultyBoost: 0, speedBoost: 0, enemyBoost: 0 },
  { id: 'hard', name: 'Difícil', detail: 'Exigente pero justo', tag: 'Duro', difficultyBoost: 0.34, speedBoost: 42, enemyBoost: 0.16 },
  { id: 'veryHard', name: 'Muy difícil', detail: 'Poco margen', tag: 'Pro', difficultyBoost: 0.56, speedBoost: 68, enemyBoost: 0.24 },
  { id: 'extreme', name: 'Extremo', detail: 'Muy exigente', tag: 'Máximo', difficultyBoost: 0.96, speedBoost: 118, enemyBoost: 0.42 },
  { id: 'impossible', name: 'Imposible', detail: 'Al límite', tag: 'Locura', difficultyBoost: 1.32, speedBoost: 168, enemyBoost: 0.62 },
];

let selectedModeId = null;
let selectedDifficultyId = null;
let modeSelectorRenderedFor = '';
let difficultySelectorRenderedFor = '';
let currentStep = 'mode';
let menuWasVisible = false;
let characterChosenInFlow = false;

function selectedDifficulty() {
  return difficulties.find((difficulty) => difficulty.id === selectedDifficultyId) || difficulties[2];
}

function selectedMode() {
  const mode = modes.find((item) => item.id === selectedModeId) || modes[0];
  const difficulty = selectedDifficulty();

  return {
    ...mode,
    difficulty,
    difficultyId: difficulty.id,
    difficultyName: difficulty.name,
    difficultyBoost: (mode.difficultyBoost || 0) + (difficulty.difficultyBoost || 0),
    speedBoost: (mode.speedBoost || 0) + (difficulty.speedBoost || 0),
    enemyBoost: (mode.enemyBoost || 0) + (difficulty.enemyBoost || 0),
    enemySpawnMultiplier: mode.enemySpawnMultiplier ?? 1,
    disableEnemies: mode.id === 'peaceful',
  };
}

function setSelectedMode(modeId, advance = true) {
  if (!modes.some((mode) => mode.id === modeId)) return;
  selectedModeId = modeId;
  localStorage.setItem(MODE_KEY, selectedModeId);
  renderModeSelector(true);
  updateLevelRecordLabels();
  window.dispatchEvent(new CustomEvent('hamster-run-mode-change', { detail: selectedMode() }));
  if (advance) showStep('difficulty', true);
}

function setSelectedDifficulty(difficultyId, advance = true) {
  if (!difficulties.some((difficulty) => difficulty.id === difficultyId)) return;
  selectedDifficultyId = difficultyId;
  localStorage.setItem(DIFFICULTY_KEY, selectedDifficultyId);
  renderDifficultySelector(true);
  updateLevelRecordLabels();
  window.dispatchEvent(new CustomEvent('hamster-run-mode-change', { detail: selectedMode() }));
  if (advance) showStep('character', true);
}

function resetFlowSelections() {
  selectedModeId = null;
  selectedDifficultyId = null;
  characterChosenInFlow = false;
  modeSelectorRenderedFor = '';
  difficultySelectorRenderedFor = '';
  renderModeSelector(true);
  renderDifficultySelector(true);
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
  const difficultyId = selectedDifficultyId || 'medium';
  const modeRecords = readJson(MODE_RECORD_KEY);
  const legacyRecords = readJson(LEGACY_RECORD_KEY);
  const difficultyRecord = modeRecords[`${modeId}:${difficultyId}:${levelId}`] || 0;
  const modeRecord = modeRecords[`${modeId}:${levelId}`] || 0;

  if (modeId === 'endless' && difficultyId === 'medium') {
    return Math.max(difficultyRecord, modeRecord, legacyRecords[levelId] || 0);
  }

  return Math.max(difficultyRecord, modeRecord);
}

function injectStepperStyles() {
  if (document.querySelector('#modeStepperStyles')) return;

  const style = document.createElement('style');
  style.id = 'modeStepperStyles';
  style.textContent = `
    .level-panel { gap: 0; }

    #selectionProgress,
    #backHomeButton,
    #selectionNextButton,
    #startButton {
      display: none !important;
    }

    .selection-step[hidden],
    #levelGrid[hidden] {
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

    .mode-grid,
    .difficulty-grid,
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

    .difficulty-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .difficulty-card,
    .mode-card {
      width: 100%;
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
  document.querySelector('#selectionProgress')?.remove();
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
    <p class="selection-step-help">Elige el tipo de partida.</p>
  `;

  menuScrollArea.insertBefore(section, characterSelect || menuScrollArea.firstChild);
}

function ensureDifficultySelector() {
  const menuScrollArea = document.querySelector('.menu-scroll-area');
  const characterSelect = document.querySelector('.character-select');
  if (!menuScrollArea || document.querySelector('#difficultySelect')) return;

  const section = document.createElement('div');
  section.id = 'difficultySelect';
  section.className = 'difficulty-select selection-step';
  section.dataset.step = 'difficulty';
  section.setAttribute('aria-label', 'Selector de nivel de dificultad');
  section.innerHTML = `
    <p class="eyebrow">Nivel</p>
    <div class="difficulty-grid" id="difficultyGrid"></div>
    <p class="selection-step-help">Este nivel se aplica a cualquier pantalla que elijas después.</p>
  `;

  menuScrollArea.insertBefore(section, characterSelect || menuScrollArea.firstChild);
}

function ensureLevelSection() {
  const levelGrid = document.querySelector('#levelGrid');
  const section = levelGrid?.closest('.level-select');
  if (!levelGrid || !section) return;

  section.id = 'levelSelect';
  section.classList.add('selection-step');
  section.dataset.step = 'level';
  section.setAttribute('aria-label', 'Selector de pantalla');
  section.querySelector('.section-heading .eyebrow, .eyebrow')?.replaceChildren(document.createTextNode('Pantalla'));
  levelGrid.hidden = false;
  levelGrid.removeAttribute('inert');
}

function ensureStepStructure() {
  injectStepperStyles();
  ensureStepper();
  ensureModeSelector();
  ensureDifficultySelector();
  ensureLevelSection();

  const characterSelect = document.querySelector('.character-select');
  const levelSelect = document.querySelector('#levelSelect');
  const backHomeButton = document.querySelector('#backHomeButton');

  characterSelect?.classList.add('selection-step');
  characterSelect?.setAttribute('data-step', 'character');
  levelSelect?.classList.add('selection-step');
  levelSelect?.setAttribute('data-step', 'level');
  backHomeButton?.setAttribute('hidden', '');
  backHomeButton?.setAttribute('inert', '');

  ensureStepActions();
  setupAutoAdvanceDelegation();
}

function ensureStepActions() {
  const startButton = document.querySelector('#startButton');
  if (!startButton || document.querySelector('#selectionStepActions')) return;

  const parent = startButton.parentNode;
  const actions = document.createElement('div');
  actions.id = 'selectionStepActions';
  actions.className = 'selection-step-actions';
  actions.innerHTML = `
    <button id="selectionBackButton" class="ghost-button" type="button">Volver</button>
    <button id="selectionNextButton" class="primary-button" type="button" hidden>Continuar</button>
  `;

  parent.insertBefore(actions, startButton);
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

  const modeEmojis = { endless: '♾️', timeAttack: '⏱️', challenge: '🏆', peaceful: '🧘', horde: '🦊' };
  for (const mode of modes) {
    const button = document.createElement('button');
    const selected = mode.id === selectedModeId;
    button.type = 'button';
    button.className = 'level-card';
    button.dataset.mode = mode.id;
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-current', selected ? 'true' : 'false');
    button.innerHTML = `
      <span>
        <strong>${modeEmojis[mode.id] || '🎮'} ${mode.name}</strong>
      </span>
    `;
    button.addEventListener('click', () => setSelectedMode(mode.id, true));
    grid.append(button);
  }
}

function renderDifficultySelector(force = false) {
  ensureStepStructure();
  const grid = document.querySelector('#difficultyGrid');
  if (!grid) return;

  const renderKey = `${selectedDifficultyId || 'none'}:${difficulties.length}`;
  if (!force && difficultySelectorRenderedFor === renderKey && grid.children.length === difficulties.length) return;

  difficultySelectorRenderedFor = renderKey;
  grid.replaceChildren();
  grid.setAttribute('role', 'group');
  grid.setAttribute('aria-label', 'Selector de nivel');

  const diffEmojis = { tutorial: '🌱', basic: '🐣', medium: '🐹', hard: '🔥', veryHard: '⚡', extreme: '💀', impossible: '👹' };
  for (const difficulty of difficulties) {
    const button = document.createElement('button');
    const selected = difficulty.id === selectedDifficultyId;
    button.type = 'button';
    button.className = 'level-card';
    button.dataset.difficulty = difficulty.id;
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-current', selected ? 'true' : 'false');
    button.innerHTML = `
      <span>
        <strong>${diffEmojis[difficulty.id] || '📈'} ${difficulty.name}</strong>
      </span>
    `;
    button.addEventListener('click', () => setSelectedDifficulty(difficulty.id, true));
    grid.append(button);
  }
}

function updateLevelRecordLabels() {
  const cards = [...document.querySelectorAll('#levelGrid .level-card')];
  const mode = selectedMode();
  const difficulty = selectedDifficulty();

  cards.forEach((card, index) => {
    const levelId = LEVEL_IDS[index];
    const small = card.querySelector('small');
    const strong = card.querySelector('strong');

    if (strong && strong.textContent === 'Tutorial') strong.textContent = 'Pantalla tutorial';
    if (!levelId || !small) return;

    const nextText = `Récord ${mode.name} · ${difficulty.name}: ${recordForLevel(levelId)}`;
    if (small.textContent !== nextText) small.textContent = nextText;
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

  const titles = { mode: 'Modo', difficulty: 'Nivel', character: 'Personaje', level: 'Pantalla' };
  const descriptions = { mode: '', difficulty: '', character: '', level: selectedDifficultyId ? `Nivel elegido: ${selectedDifficulty().name}` : '' };

  if (title) title.textContent = titles[step];
  if (copy) copy.textContent = descriptions[step];

  if (step === 'character' && !characterChosenInFlow) clearButtonSelection(document.querySelector('#characterGrid'));

  document.querySelectorAll('.selection-step').forEach((section) => {
    const active = section.dataset.step === step;
    section.hidden = !active;
    section.toggleAttribute('inert', !active);
    section.setAttribute('aria-hidden', String(!active));
  });

  if (step === 'level') {
    const levelGrid = document.querySelector('#levelGrid');
    levelGrid.hidden = false;
    levelGrid.removeAttribute('inert');
    levelGrid.setAttribute('aria-hidden', 'false');
  }

  if (backButton) backButton.hidden = step === 'mode';

  updateLevelRecordLabels();
  resetStepScroll();
  if (focus) focusCurrentStep();
}

function resetStepScroll() {
  const panel = document.querySelector('.level-panel');
  const activeStep = document.querySelector(`.selection-step[data-step="${currentStep}"]`);
  if (panel) panel.scrollTo({ top: 0, behavior: 'smooth' });
  activeStep?.scrollTo?.({ top: 0, behavior: 'instant' });
  const grid = activeStep?.querySelector('.mode-grid, .difficulty-grid, .character-grid, .level-grid');
  grid?.scrollTo?.({ top: 0, behavior: 'instant' });
}

function focusCurrentStep() {
  const activeStep = document.querySelector(`.selection-step[data-step="${currentStep}"]`);
  const selected = activeStep?.querySelector('[aria-pressed="true"]');
  const firstButton = activeStep?.querySelector('button');
  window.requestAnimationFrame(() => (selected || firstButton)?.focus?.({ preventScroll: true }));
}

function setupGridKeyboard(selector) {
  document.addEventListener('keydown', (event) => {
    const grid = document.querySelector(selector);
    if (!grid || !grid.contains(document.activeElement)) return;
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) return;

    const buttons = [...grid.querySelectorAll('button')];
    if (!buttons.length || event.key === 'Enter' || event.key === ' ') return;

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

function setupModeKeyboard() {
  setupGridKeyboard('#modeGrid');
  setupGridKeyboard('#difficultyGrid');
}

function install() {
  const menu = document.querySelector('#menu');

  if (menu) {
    const observer = new MutationObserver(() => {
      const visible = !menu.hidden && menu.classList.contains('is-visible');
      window.requestAnimationFrame(() => {
        renderModeSelector();
        renderDifficultySelector();
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
  renderDifficultySelector(true);
  updateLevelRecordLabels();
  showStep('mode');
  setupModeKeyboard();
}

window.HamsterRunModes = {
  all: modes,
  difficulties,
  getSelectedMode: selectedMode,
  getSelectedModeId: () => selectedMode().id,
  getSelectedDifficulty: selectedDifficulty,
  getSelectedDifficultyId: () => selectedDifficulty().id,
  setSelectedMode,
  setSelectedDifficulty,
  refreshRecords: updateLevelRecordLabels,
  showStep,
};

install();
