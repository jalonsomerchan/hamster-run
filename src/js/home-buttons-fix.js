const HOME_BUTTON_SELECTORS = [
  '#newGameButton',
  '#aboutButton',
  '#shareButton',
  '#startButton',
  '#backHomeButton',
  '#retryButton',
  '#levelsButton',
].join(',');

const handledPointers = new Set();
let syntheticClickInProgress = false;

function overlayIsVisible(overlay) {
  return Boolean(overlay && !overlay.hidden && overlay.classList.contains('is-visible'));
}

function showOverlay(overlay) {
  document.querySelectorAll('.overlay').forEach((item) => {
    const active = item === overlay;
    item.hidden = !active;
    item.classList.toggle('is-visible', active);
  });
}

function forceOpenLevelMenu() {
  const menu = document.querySelector('#menu');
  if (!menu || overlayIsVisible(menu)) return;

  showOverlay(menu);

  document.querySelector('.hud')?.setAttribute('hidden', '');
  document.querySelector('.game-controls')?.setAttribute('hidden', '');
  window.HamsterRunModes?.showStep?.('mode', true);
}

function forceOpenHome() {
  const home = document.querySelector('#home');
  if (!home || overlayIsVisible(home)) return;

  showOverlay(home);
  document.querySelector('.hud')?.setAttribute('hidden', '');
  document.querySelector('.game-controls')?.setAttribute('hidden', '');
}

function explainHowToPlay() {
  window.alert('Toca para saltar. Segundo toque: doble salto. Recoge nueces y corazones, evita enemigos.');
}

async function shareFromHome(button) {
  const shareData = {
    title: 'Hamster Run',
    text: 'Corre en Hamster Run y supera tu marca.',
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard?.writeText(window.location.href);
    if (button) {
      const previousText = button.textContent;
      button.textContent = 'Enlace copiado';
      window.setTimeout(() => {
        button.textContent = previousText || 'Compartir';
      }, 1400);
    }
  } catch {
    // El usuario puede cancelar el diálogo de compartir. No hay que romper el menú.
  }
}

function dispatchNativeClick(button) {
  if (!button || syntheticClickInProgress) return;

  syntheticClickInProgress = true;
  button.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  }));
  syntheticClickInProgress = false;
}

function activateHomeButton(button) {
  if (!button) return;

  if (button.id === 'aboutButton') {
    explainHowToPlay();
    return;
  }

  if (button.id === 'shareButton') {
    shareFromHome(button);
    return;
  }

  dispatchNativeClick(button);

  if (button.id === 'newGameButton' || button.id === 'levelsButton') {
    window.setTimeout(forceOpenLevelMenu, 80);
    return;
  }

  if (button.id === 'backHomeButton') {
    window.setTimeout(forceOpenHome, 80);
  }
}

function interceptActivation(event) {
  if (syntheticClickInProgress || event.defaultPrevented) return;

  const button = event.target.closest?.(HOME_BUTTON_SELECTORS);
  if (!button || button.disabled) return;

  if (event.type === 'pointerup') {
    handledPointers.add(event.pointerId);
  }

  if (event.type === 'click' && event.pointerId && handledPointers.has(event.pointerId)) {
    handledPointers.delete(event.pointerId);
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
  activateHomeButton(button);
}

function installHomeButtonsFix() {
  document.addEventListener('pointerup', interceptActivation, { capture: true, passive: false });
  document.addEventListener('click', interceptActivation, { capture: true, passive: false });
}

installHomeButtonsFix();
