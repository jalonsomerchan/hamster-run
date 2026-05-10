const ACTIVE_OVERLAY_SELECTOR = '.overlay.is-visible:not([hidden])';
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const canvas = document.querySelector('#game');
const overlays = [...document.querySelectorAll('.overlay')];
const levelGrid = document.querySelector('#levelGrid');
const characterGrid = document.querySelector('#characterGrid');
const livesEl = document.querySelector('#lives');
const scoreEl = document.querySelector('#score');
const peanutsEl = document.querySelector('#peanuts');
const timeEl = document.querySelector('#time');

let lastFocusedElement = null;
let activeOverlay = null;
let lastAnnouncedLives = livesEl?.textContent?.length ?? 0;

function injectAccessibilityStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    button:focus-visible,
    [tabindex]:focus-visible,
    .level-card:focus-visible,
    .character-card:focus-visible {
      outline: 3px solid #fff8df;
      outline-offset: 3px;
      box-shadow: 0 0 0 6px rgba(52, 38, 22, 0.36);
    }

    .level-card[aria-pressed='true'],
    .character-card[aria-pressed='true'] {
      position: relative;
    }
  `;
  document.head.append(style);
}

function ensureLiveRegion() {
  let region = document.querySelector('#gameStatus');

  if (!region) {
    region = document.createElement('p');
    region.id = 'gameStatus';
    region.className = 'sr-only';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    document.body.append(region);
  }

  return region;
}

function ensureCanvasDescription() {
  if (!canvas) return;

  let description = document.querySelector('#gameDescription');

  if (!description) {
    description = document.createElement('p');
    description.id = 'gameDescription';
    description.className = 'sr-only';
    description.textContent = 'Juego Hamster Run. Toca la pantalla, pulsa Espacio o pulsa Flecha arriba para saltar. En partida puedes hacer doble salto.';
    document.body.append(description);
  }

  canvas.setAttribute('role', 'img');
  canvas.setAttribute('tabindex', '0');
  canvas.setAttribute('aria-describedby', 'gameDescription gameStatus');
  canvas.setAttribute('aria-label', 'Área de juego de Hamster Run');
}

function setupOverlaySemantics() {
  overlays.forEach((overlay) => {
    const heading = overlay.querySelector('h1, h2');

    if (heading && !heading.id) {
      heading.id = `${overlay.id || 'overlay'}Title`;
    }

    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('tabindex', '-1');

    if (heading?.id) {
      overlay.setAttribute('aria-labelledby', heading.id);
    }

    syncOverlayHiddenState(overlay);
  });
}

function syncOverlayHiddenState(overlay) {
  const isActive = overlay.matches(ACTIVE_OVERLAY_SELECTOR);

  overlay.toggleAttribute('inert', !isActive);
  overlay.setAttribute('aria-hidden', String(!isActive));
}

function focusOverlay(overlay) {
  const target =
    overlay.querySelector('.primary-button, button:not([disabled])') ||
    overlay.querySelector('h1, h2') ||
    overlay;

  window.requestAnimationFrame(() => {
    target.setAttribute?.('tabindex', target.matches?.('h1, h2') ? '-1' : target.getAttribute('tabindex') ?? '0');
    target.focus({ preventScroll: true });
  });
}

function restoreFocusAfterOverlay() {
  const fallback = canvas || document.querySelector('#newGameButton') || document.body;
  const target = lastFocusedElement?.isConnected ? lastFocusedElement : fallback;

  window.requestAnimationFrame(() => {
    target.focus?.({ preventScroll: true });
  });
}

function handleOverlayChanges() {
  const nextActiveOverlay = document.querySelector(ACTIVE_OVERLAY_SELECTOR);

  overlays.forEach(syncOverlayHiddenState);

  if (nextActiveOverlay && nextActiveOverlay !== activeOverlay) {
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : lastFocusedElement;
    activeOverlay = nextActiveOverlay;
    focusOverlay(nextActiveOverlay);
    announceOverlay(nextActiveOverlay);
    return;
  }

  if (!nextActiveOverlay && activeOverlay) {
    activeOverlay = null;
    restoreFocusAfterOverlay();
  }
}

function announceOverlay(overlay) {
  const title = overlay.querySelector('h1, h2')?.textContent?.trim();
  const status = ensureLiveRegion();

  if (title) {
    status.textContent = title;
  }
}

function getFocusableItems(container) {
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter((element) => {
    return !element.closest('[hidden], [inert]') && element.offsetParent !== null;
  });
}

function trapOverlayFocus(event) {
  if (event.key !== 'Tab') return;

  const overlay = document.querySelector(ACTIVE_OVERLAY_SELECTOR);
  if (!overlay) return;

  const focusable = getFocusableItems(overlay);
  if (!focusable.length) {
    event.preventDefault();
    overlay.focus({ preventScroll: true });
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus({ preventScroll: true });
    return;
  }

  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}

function enhanceSelectionGrid(grid, label) {
  if (!grid) return;

  grid.setAttribute('role', 'group');
  grid.setAttribute('aria-label', label);

  const buttons = [...grid.querySelectorAll('button')];

  buttons.forEach((button, index) => {
    const text = button.textContent.replace(/\s+/g, ' ').trim();
    const selected = button.getAttribute('aria-pressed') === 'true';

    button.setAttribute('aria-label', `${text}${selected ? ', seleccionado' : ''}`);
    button.setAttribute('aria-current', selected ? 'true' : 'false');
    button.tabIndex = selected || index === 0 ? 0 : -1;
  });
}

function moveGridFocus(grid, direction) {
  const buttons = [...grid.querySelectorAll('button')];
  if (!buttons.length) return;

  const currentIndex = Math.max(0, buttons.indexOf(document.activeElement));
  const nextIndex = (currentIndex + direction + buttons.length) % buttons.length;
  const next = buttons[nextIndex];

  buttons.forEach((button) => {
    button.tabIndex = -1;
  });

  next.tabIndex = 0;
  next.focus({ preventScroll: true });
}

function setupGridKeyboardNavigation() {
  [levelGrid, characterGrid].forEach((grid) => {
    if (!grid) return;

    grid.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        return;
      }

      const buttons = [...grid.querySelectorAll('button')];
      if (!buttons.length) return;

      event.preventDefault();

      if (event.key === 'Home') {
        buttons[0].focus({ preventScroll: true });
        return;
      }

      if (event.key === 'End') {
        buttons[buttons.length - 1].focus({ preventScroll: true });
        return;
      }

      moveGridFocus(grid, event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1);
    });
  });
}

function observeSelectionGrids() {
  const observer = new MutationObserver(() => {
    enhanceSelectionGrid(levelGrid, 'Selector de nivel');
    enhanceSelectionGrid(characterGrid, 'Selector de personaje');
  });

  [levelGrid, characterGrid].forEach((grid) => {
    if (grid) {
      observer.observe(grid, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed'] });
    }
  });

  enhanceSelectionGrid(levelGrid, 'Selector de nivel');
  enhanceSelectionGrid(characterGrid, 'Selector de personaje');
}

function observeGameStatus() {
  const status = ensureLiveRegion();
  const observer = new MutationObserver(() => {
    const lives = livesEl?.textContent?.length ?? 0;

    if (lives !== lastAnnouncedLives) {
      lastAnnouncedLives = lives;
      status.textContent = lives === 1 ? 'Queda 1 vida' : `Quedan ${lives} vidas`;
    }
  });

  [livesEl, scoreEl, peanutsEl, timeEl].forEach((element) => {
    if (element) observer.observe(element, { childList: true, characterData: true, subtree: true });
  });
}

function observeOverlays() {
  const observer = new MutationObserver(handleOverlayChanges);

  overlays.forEach((overlay) => {
    observer.observe(overlay, { attributes: true, attributeFilter: ['hidden', 'class'] });
  });

  handleOverlayChanges();
}

injectAccessibilityStyles();
ensureLiveRegion();
ensureCanvasDescription();
setupOverlaySemantics();
setupGridKeyboardNavigation();
observeSelectionGrids();
observeGameStatus();
observeOverlays();
document.addEventListener('keydown', trapOverlayFocus);
