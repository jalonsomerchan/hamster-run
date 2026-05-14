import hamsterSheet from '../assets/sprites/hamster/sheet-transparent.png';

const LEVEL_RECORD_PATTERN = /(\d+)\s*$/;
const HAMSTER_FRAME_SIZE = 192;
const HAMSTER_FRAMES = 4;

let headerCanvas = null;
let headerContext = null;
let hamsterImage = null;
let animationFrame = 0;
let observer = null;

function installSelectionStyles() {
  if (document.querySelector('#selectionScreenPolishStyles')) return;

  const style = document.createElement('style');
  style.id = 'selectionScreenPolishStyles';
  style.textContent = `
    #menu .level-panel {
      display: flex !important;
      flex-direction: column !important;
      min-height: 0 !important;
    }

    #menu .selection-brand {
      position: relative !important;
      z-index: 1 !important;
      display: grid !important;
      grid-template-columns: 86px 1fr !important;
      align-items: center !important;
      gap: 12px !important;
      margin: 0 0 12px !important;
      border-radius: 14px !important;
      background: rgba(255, 249, 230, 0.58) !important;
      padding: 8px 12px !important;
    }

    #menu .selection-brand canvas {
      display: block !important;
      width: 86px !important;
      height: 58px !important;
    }

    #menu .selection-brand-title {
      color: #24140a !important;
      font-size: clamp(1.8rem, 8vw, 3rem) !important;
      font-weight: 1000 !important;
      letter-spacing: -0.05em !important;
      line-height: 0.9 !important;
      text-shadow: 0 3px 0 rgba(242, 140, 40, 0.22) !important;
    }

    #menu .screen-header {
      margin-bottom: 8px !important;
    }

    #menu .panel-footer .hint {
      display: none !important;
    }

    #menu .menu-scroll-area {
      min-height: 0 !important;
      overflow: hidden !important;
      touch-action: pan-y !important;
    }

    #menu .mode-grid,
    #menu .difficulty-grid,
    #menu .character-grid,
    #menu .level-grid {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 12px !important;
      max-height: min(50dvh, 430px) !important;
      overflow-y: auto !important;
      overscroll-behavior: contain !important;
      -webkit-overflow-scrolling: touch !important;
      touch-action: pan-y !important;
      padding: 4px 4px 14px !important;
      scroll-padding: 12px !important;
    }

    #menu .mode-card,
    #menu .difficulty-card,
    #menu .character-card,
    #menu .level-card {
      width: 100% !important;
    }

    #menu .level-card > b {
      display: none !important;
    }

    #menu .level-card small {
      display: inline-block !important;
      margin-top: 8px !important;
    }

    @media (min-width: 760px) {
      #menu .mode-grid,
      #menu .difficulty-grid,
      #menu .character-grid,
      #menu .level-grid {
        grid-template-columns: 1fr !important;
      }
    }

    @media (max-width: 430px) {
      #menu .selection-brand {
        grid-template-columns: 70px 1fr !important;
        gap: 9px !important;
        padding: 7px 10px !important;
      }

      #menu .selection-brand canvas {
        width: 70px !important;
        height: 50px !important;
      }
    }
  `;
  document.head.append(style);
}

function installSelectionHeader() {
  const panel = document.querySelector('#menu .level-panel');
  if (!panel || panel.querySelector('.selection-brand')) return;

  const header = document.createElement('div');
  header.className = 'selection-brand';
  header.setAttribute('aria-label', 'Hamster Run');
  header.innerHTML = `
    <canvas class="selection-brand-runner" width="172" height="116" aria-hidden="true"></canvas>
    <strong class="selection-brand-title">Hamster Run</strong>
  `;

  panel.insertBefore(header, panel.firstElementChild);
  headerCanvas = header.querySelector('canvas');
  headerContext = headerCanvas?.getContext('2d') || null;
  startHeaderAnimation();
}

function normalizeLevelRecords() {
  document.querySelectorAll('#levelGrid .level-card').forEach((card) => {
    card.querySelector('b')?.remove();

    const small = card.querySelector('small');
    if (!small) return;

    const match = small.textContent.match(LEVEL_RECORD_PATTERN);
    const nextText = `Récord: ${match?.[1] || '0'}`;
    if (small.textContent !== nextText) small.textContent = nextText;
  });
}

function hideHint() {
  document.querySelector('#menu .panel-footer .hint')?.remove();
}

function polishSelectionScreen() {
  installSelectionHeader();
  normalizeLevelRecords();
  hideHint();
}

function observeSelectionChanges() {
  if (observer) return;

  const menu = document.querySelector('#menu');
  if (!menu) return;

  observer = new MutationObserver(() => {
    window.requestAnimationFrame(polishSelectionScreen);
  });

  observer.observe(menu, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function startHeaderAnimation() {
  if (animationFrame || !headerCanvas || !headerContext) return;

  hamsterImage = hamsterImage || new Image();
  if (!hamsterImage.src) hamsterImage.src = hamsterSheet;

  const draw = (now) => {
    animationFrame = window.requestAnimationFrame(draw);
    drawHeaderHamster(now);
  };

  animationFrame = window.requestAnimationFrame(draw);
}

function drawHeaderHamster(now) {
  if (!headerCanvas || !headerContext || !hamsterImage?.complete) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = headerCanvas.clientWidth || 86;
  const cssHeight = headerCanvas.clientHeight || 58;
  const width = Math.floor(cssWidth * dpr);
  const height = Math.floor(cssHeight * dpr);

  if (headerCanvas.width !== width || headerCanvas.height !== height) {
    headerCanvas.width = width;
    headerCanvas.height = height;
  }

  headerContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  headerContext.clearRect(0, 0, cssWidth, cssHeight);

  const frame = Math.floor(now / 110) % HAMSTER_FRAMES;
  const bob = Math.sin(now / 130) * 2;
  const drawWidth = cssWidth * 0.92;
  const drawHeight = cssHeight * 1.16;
  const x = (cssWidth - drawWidth) / 2;
  const y = cssHeight - drawHeight + 7 + bob;

  headerContext.drawImage(
    hamsterImage,
    frame * HAMSTER_FRAME_SIZE,
    0,
    HAMSTER_FRAME_SIZE,
    HAMSTER_FRAME_SIZE,
    x,
    y,
    drawWidth,
    drawHeight,
  );
}

function installSelectionScreenPolish() {
  installSelectionStyles();
  polishSelectionScreen();
  observeSelectionChanges();
}

installSelectionScreenPolish();
