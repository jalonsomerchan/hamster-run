const PAUSE_MENU_ID = 'pauseActionMenu';
const PAUSE_BUTTON_SELECTOR = '#gameMenuButton';

let lastFocusedElement = null;

function controls() {
  return window.HamsterRunPauseControls;
}

function ensurePauseMenu() {
  let overlay = document.querySelector(`#${PAUSE_MENU_ID}`);
  if (overlay) return overlay;

  overlay = document.createElement('section');
  overlay.id = PAUSE_MENU_ID;
  overlay.className = 'overlay pause-action-overlay';
  overlay.hidden = true;
  overlay.setAttribute('aria-label', 'Pausa');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="panel pause-action-panel">
      <div class="screen-header screen-header--center">
        <p class="eyebrow">Partida pausada</p>
        <h2>Pausa</h2>
        <p class="copy">¿Qué quieres hacer?</p>
      </div>
      <div class="menu-actions pause-action-buttons" aria-label="Opciones de pausa">
        <button id="pauseContinueButton" class="primary-button" type="button">Continuar</button>
        <button id="pauseRestartButton" class="ghost-button" type="button">Reiniciar nivel</button>
        <button id="pauseHomeButton" class="ghost-button" type="button">Volver al inicio</button>
      </div>
    </div>
  `;

  document.querySelector('.game-shell')?.append(overlay);
  overlay.querySelector('#pauseContinueButton')?.addEventListener('click', resumeGame);
  overlay.querySelector('#pauseRestartButton')?.addEventListener('click', restartLevel);
  overlay.querySelector('#pauseHomeButton')?.addEventListener('click', goHome);
  return overlay;
}

function installPauseStyles() {
  if (document.querySelector('#pauseActionMenuStyles')) return;

  const style = document.createElement('style');
  style.id = 'pauseActionMenuStyles';
  style.textContent = `
    #pauseActionMenu {
      z-index: 40 !important;
      background: linear-gradient(180deg, rgba(12, 18, 14, 0.62), rgba(12, 18, 14, 0.86)) !important;
    }

    #pauseActionMenu .pause-action-panel {
      width: min(92vw, 460px) !important;
      max-height: calc(100dvh - 34px) !important;
    }

    #pauseActionMenu .pause-action-buttons {
      margin-top: 18px !important;
    }

    #pauseActionMenu .ghost-button:nth-of-type(2) {
      background: var(--hr-tertiary, #8a5a32) !important;
      color: var(--hr-tertiary-ink, #fff7dc) !important;
    }
  `;
  document.head.append(style);
}

function showPauseMenu() {
  const api = controls();
  if (!api || api.getMode?.() !== 'running') return;

  lastFocusedElement = document.activeElement;
  api.pause?.();

  const overlay = ensurePauseMenu();
  overlay.hidden = false;
  overlay.classList.add('is-visible');
  overlay.setAttribute('aria-hidden', 'false');
  window.requestAnimationFrame(() => overlay.querySelector('#pauseContinueButton')?.focus?.({ preventScroll: true }));
}

function hidePauseMenu() {
  const overlay = ensurePauseMenu();
  overlay.classList.remove('is-visible');
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');
}

function resumeGame() {
  hidePauseMenu();
  controls()?.resume?.();
  lastFocusedElement?.focus?.({ preventScroll: true });
}

function restartLevel() {
  hidePauseMenu();
  controls()?.restartLevel?.();
}

function goHome() {
  hidePauseMenu();
  controls()?.goHome?.();
}

function handlePauseButton(event) {
  const button = event.target.closest?.(PAUSE_BUTTON_SELECTOR);
  if (!button) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  showPauseMenu();
}

function handleKeydown(event) {
  const overlay = ensurePauseMenu();
  if (overlay.hidden) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    resumeGame();
    return;
  }

  if (event.key !== 'Tab') return;

  const buttons = [...overlay.querySelectorAll('button:not([disabled])')];
  if (!buttons.length) return;

  const first = buttons[0];
  const last = buttons[buttons.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function installPauseMenuActions() {
  installPauseStyles();
  ensurePauseMenu();
  document.addEventListener('pointerup', handlePauseButton, { capture: true, passive: false });
  document.addEventListener('click', handlePauseButton, { capture: true, passive: false });
  document.addEventListener('keydown', handleKeydown, { capture: true });
}

installPauseMenuActions();
