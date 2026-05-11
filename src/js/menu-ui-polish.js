const style = document.createElement('style');
style.dataset.hamsterMenuUiPolish = 'true';
style.textContent = `
  body {
    background:
      radial-gradient(circle at 50% 0%, rgba(255, 224, 133, 0.18), transparent 30%),
      linear-gradient(180deg, rgba(255, 248, 223, 0.12), transparent 36%),
      linear-gradient(140deg, #244b36 0%, #162a23 48%, #101917 100%);
  }

  button:focus-visible {
    outline: 3px solid rgba(255, 255, 255, 0.86);
    outline-offset: 3px;
  }

  .overlay {
    background:
      radial-gradient(circle at 50% 18%, rgba(255, 235, 168, 0.16), transparent 36%),
      rgba(17, 25, 21, 0.58);
  }

  .panel {
    width: min(100%, 520px);
    border-radius: 24px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.34), transparent 34%),
      linear-gradient(180deg, #fff6db 0%, #ffe9b4 100%);
    box-shadow: 0 28px 70px rgba(12, 18, 14, 0.38);
    padding: clamp(18px, 4.6vw, 28px);
    scrollbar-width: thin;
  }

  .panel::-webkit-scrollbar,
  .menu-scroll-area::-webkit-scrollbar,
  .level-grid::-webkit-scrollbar {
    width: 7px;
  }

  .panel::-webkit-scrollbar-thumb,
  .menu-scroll-area::-webkit-scrollbar-thumb,
  .level-grid::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(81, 57, 30, 0.24);
  }

  .home-panel,
  .result-panel,
  .screen-header--center {
    text-align: center;
  }

  .level-panel {
    overflow: hidden;
  }

  .screen-header {
    flex: none;
  }

  #heroPreview {
    width: min(66vw, 210px);
    height: clamp(108px, 22dvh, 150px);
    margin: 12px auto 18px;
  }

  .menu-actions,
  .panel-footer {
    display: grid;
    gap: 10px;
  }

  .panel-footer {
    flex: none;
    padding-top: 12px;
    border-top: 1px solid rgba(81, 57, 30, 0.13);
    background: linear-gradient(180deg, rgba(255, 233, 180, 0), rgba(255, 233, 180, 0.82) 28%);
    pointer-events: auto;
  }

  .menu-scroll-area {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    padding: 2px 3px 8px 0;
  }

  .character-select,
  .level-select,
  .mode-select {
    margin-top: 14px;
  }

  .mode-card,
  .character-card,
  .level-card {
    border-radius: 18px;
    box-shadow: 0 7px 0 rgba(153, 99, 31, 0.17);
    transition:
      transform 120ms ease,
      box-shadow 120ms ease,
      background 120ms ease,
      border-color 120ms ease,
      filter 120ms ease;
  }

  .mode-card:active,
  .character-card:active,
  .level-card:active,
  .primary-button:active,
  .ghost-button:active,
  .game-controls button:active {
    transform: translateY(2px);
  }

  .mode-card[aria-pressed='true'],
  .character-card[aria-pressed='true'],
  .level-card[aria-pressed='true'] {
    box-shadow: inset 0 0 0 2px rgba(95, 143, 67, 0.22), 0 7px 0 rgba(64, 105, 39, 0.16);
  }

  .eyebrow {
    font-size: 0.76rem;
    font-weight: 1000;
    letter-spacing: 0.02em;
  }

  h1,
  h2 {
    letter-spacing: -0.04em;
  }

  .copy,
  .hint {
    font-size: clamp(0.9rem, 3.5vw, 1rem);
    font-weight: 700;
    line-height: 1.32;
  }

  .hint {
    margin: 0;
  }

  .level-grid {
    margin: 8px 0 0;
    max-height: none;
    overflow: visible;
  }

  .primary-button,
  .ghost-button {
    min-height: 52px;
    font-size: 1rem;
    font-weight: 1000;
    pointer-events: auto;
    transition:
      transform 120ms ease,
      box-shadow 120ms ease,
      background 120ms ease,
      filter 120ms ease;
  }

  .primary-button {
    background: linear-gradient(180deg, #ff8a3c, #e66026);
    box-shadow: 0 6px 0 #993f1c, 0 12px 26px rgba(153, 63, 28, 0.22);
  }

  .ghost-button {
    margin-top: 0;
    background: rgba(255, 248, 223, 0.36);
  }

  .ghost-button:hover,
  .primary-button:hover,
  .level-card:hover,
  .character-card:hover,
  .mode-card:hover,
  .game-controls button:hover {
    filter: brightness(1.02);
  }

  @media (max-width: 430px) {
    .panel {
      border-radius: 20px;
    }

    .mode-grid,
    .character-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 7px;
    }

    .character-card {
      padding: 7px 5px;
    }

    .character-card canvas {
      height: 52px;
    }
  }

  @media (max-height: 720px) {
    .overlay {
      padding-top: max(10px, env(safe-area-inset-top));
      padding-bottom: max(10px, env(safe-area-inset-bottom));
    }

    .panel {
      max-height: calc(100dvh - 20px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    }

    #heroPreview {
      height: 96px;
      margin: 8px auto 12px;
    }

    .primary-button,
    .ghost-button {
      min-height: 48px;
    }
  }

  @media (min-width: 760px) {
    .level-panel {
      width: min(100%, 720px);
    }

    .menu-scroll-area {
      max-height: min(58dvh, 560px);
    }
  }
`;
document.head.append(style);

function protectMenuButtonTaps() {
  const menuSelectors = [
    '#newGameButton',
    '#aboutButton',
    '#shareButton',
    '#startButton',
    '#backHomeButton',
    '#retryButton',
    '#levelsButton',
    '#gameMenuButton',
    '.level-card',
    '.character-card',
    '.mode-card',
  ].join(',');

  document.addEventListener(
    'pointerdown',
    (event) => {
      const target = event.target.closest?.(menuSelectors);
      if (!target) return;
      target.classList.add('is-pressing');
      window.setTimeout(() => target.classList.remove('is-pressing'), 140);
    },
    { passive: true },
  );
}

protectMenuButtonTaps();
