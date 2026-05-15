import { levels, characters } from '../config/gameConfig.js';
import { sprites } from '../config/assets.js';
import { random } from '../utils/math.js';
import { readRecords, saveRecord } from '../utils/storage.js';
import { state, bursts } from './state.js';
import { applyCharacter, playSound } from './player.js';

let scoreEl, peanutsEl, timeEl, livesEl;
let hud, gameControls;
let home, menu, gameOver;
let levelGrid, characterGrid;
let finalScore, finalPeanuts, finalTime, finalRecord;
let modeTimeLeftRef = null;

export function initUI(elements) {
  scoreEl = elements.scoreEl;
  peanutsEl = elements.peanutsEl;
  timeEl = elements.timeEl;
  livesEl = elements.livesEl;
  hud = elements.hud;
  gameControls = elements.gameControls;
  home = elements.home;
  menu = elements.menu;
  gameOver = elements.gameOver;
  levelGrid = elements.levelGrid;
  characterGrid = elements.characterGrid;
  finalScore = elements.finalScore;
  finalPeanuts = elements.finalPeanuts;
  finalTime = elements.finalTime;
  finalRecord = elements.finalRecord;
}

export function setModeTimeLeftRef(getter) {
  modeTimeLeftRef = getter;
}

export function buildLevelMenu() {
  const records = readRecords();
  levelGrid.innerHTML = '';
  levels.forEach((level, index) => {
    const record = records[level.id] || 0;
    const selected = index === state.selectedLevel;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'level-card';
    card.dataset.level = String(index);
    card.setAttribute('aria-pressed', String(selected));
    card.setAttribute('aria-current', selected ? 'true' : 'false');
    card.setAttribute('aria-label', `${level.name}. ${level.detail}. ${selected ? 'Seleccionado' : 'Tocar para elegir'}`);
    if (level.background) {
      card.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url(${level.background})`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
    }
    const levelEmojis = { tutorial: '🎓', meadow: '🌿', clover: '🍀', bridge: '🌉', cookie: '🍪', straw: '🌾', moon: '🌑' };
    card.innerHTML = `
      <span>
        <strong>${levelEmojis[level.id] || '🗺️'} ${level.name}</strong>
      </span>
      <small>Récord: ${record}</small>
    `;
    card.addEventListener('click', () => {
      state.selectedLevel = index;
      state.level = levels[index];
      buildLevelMenu();
    });
    levelGrid.append(card);
  });
}

export function buildCharacterMenu() {
  characterGrid.innerHTML = '';
  characters.forEach((character, index) => {
    const button = document.createElement('button');
    const preview = document.createElement('canvas');
    const label = document.createElement('span');
    button.type = 'button';
    button.className = 'character-card';
    button.setAttribute('aria-pressed', String(index === state.selectedCharacter));
    label.textContent = character.name;
    button.append(preview, label);
    button.addEventListener('click', () => {
      state.selectedCharacter = index;
      applyCharacter();
      buildCharacterMenu();
    });
    characterGrid.append(button);
    drawCharacterCard(preview, character.sprite);
  });
}

function drawCharacterCard(preview, sprite) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = preview.clientWidth || 96;
  const cssHeight = preview.clientHeight || 58;
  const width = Math.max(1, Math.floor(cssWidth * dpr));
  const height = Math.max(1, Math.floor(cssHeight * dpr));
  preview.width = width;
  preview.height = height;
  const previewCtx = preview.getContext('2d');
  previewCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  previewCtx.clearRect(0, 0, cssWidth, cssHeight);
  previewCtx.drawImage(sprite.image, 0, 0, sprite.cell, sprite.cell, 8, -4, cssWidth - 16, cssHeight + 12);
}

export function setActiveOverlay(activeOverlay) {
  [home, menu, gameOver].forEach((overlay) => {
    const isActive = overlay === activeOverlay;
    overlay.hidden = !isActive;
    overlay.classList.toggle('is-visible', isActive);
  });
}

export function syncGameChrome() {
  const inGame = state.mode === 'running';
  hud.hidden = !inGame;
  gameControls.hidden = !inGame;
}

export function showHome() {
  state.mode = 'home';
  setActiveOverlay(home);
  syncGameChrome();
}

export function showLevelSelect() {
  state.mode = 'menu';
  setActiveOverlay(menu);
  buildCharacterMenu();
  buildLevelMenu();
  syncGameChrome();
}

export async function shareGame(shareButton) {
  const shareData = {
    title: 'Hamster Run',
    text: 'Corre en Hamster Run y supera tu marca.',
    url: window.location.href,
  };
  if (navigator.share) {
    await navigator.share(shareData);
    return;
  }
  await navigator.clipboard?.writeText(window.location.href);
  shareButton.textContent = 'Enlace copiado';
  window.setTimeout(() => {
    shareButton.textContent = 'Compartir juego';
  }, 1400);
}

export function updateHud() {
  scoreEl.textContent = Math.floor(state.score);
  peanutsEl.textContent = state.peanuts;

  const displayTime = modeTimeLeftRef ? modeTimeLeftRef() : state.time;
  timeEl.textContent = (displayTime ?? state.time).toFixed(1) + 's';

  livesEl.textContent = '❤️'.repeat(Math.max(0, state.lives));
}

export function endGame() {
  if (state.mode !== 'running') return;
  playSound('gameOver');
  state.mode = 'over';
  state.shake = 4;
  const record = saveRecord(state.level.id, state.score);
  const rank = state.score > 20000 ? 'HAMSTER DIVINO' : state.score > 10000 ? 'MAESTRO CORREDOR' : state.score > 5000 ? 'PRO HAMSTER' : 'NOVATO';

  finalScore.textContent = Math.floor(state.score);
  finalScore.dataset.rank = rank;

  finalPeanuts.textContent = String(state.peanuts);
  finalTime.textContent = `${Math.floor(state.time)}s`;

  if (record.improved) {
    finalRecord.innerHTML = `<span class="new-record-label">NUEVO RÉCORD</span> ${record.next}`;
    finalRecord.classList.add('pulse-animation');
    // Celebration particles
    for (let i = 0; i < 60; i++) {
      bursts.push({
        x: state.width / 2 + random(-120, 120),
        y: state.height / 2 + random(-120, 120),
        ttl: random(1.0, 2.2),
        life: 0,
        radius: random(4, 14),
        color: ['#f28c28', '#6ea64f', '#39a8ff', '#ff3f66', '#ffd700'][Math.floor(Math.random() * 5)],
        vx: random(-250, 250),
        vy: random(-500, -150),
      });
    }
  } else {
    finalRecord.textContent = String(record.next);
    finalRecord.classList.remove('pulse-animation');
  }
  buildLevelMenu();
  setActiveOverlay(gameOver);
  syncGameChrome();
}

export function installConsolidatedPolish() {
  const style = document.createElement('style');
  style.id = 'consolidatedGameStyles';
  style.textContent = `
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
    #menu .level-panel { display: flex !important; flex-direction: column !important; min-height: 0 !important; overflow: hidden !important; }
    #menu .selection-brand { position: relative !important; z-index: 1 !important; display: grid !important; grid-template-columns: 86px 1fr !important; align-items: center !important; flex: 0 0 auto !important; gap: 12px !important; margin: 0 0 12px !important; border-radius: 14px !important; background: rgba(255, 249, 230, 0.58) !important; padding: 8px 12px !important; }
    #menu .selection-brand canvas { display: block !important; width: 86px !important; height: 58px !important; }
    #menu .selection-brand-title { color: #24140a !important; font-size: clamp(1.8rem, 8vw, 3rem) !important; font-weight: 1000 !important; letter-spacing: -0.05em !important; line-height: 0.9 !important; text-shadow: 0 3px 0 rgba(242, 140, 40, 0.22) !important; }
    #pauseActionMenu { z-index: 40 !important; }
    #pauseActionMenu .pause-action-panel { width: min(92vw, 460px) !important; max-height: calc(100dvh - 34px) !important; }

    .pulse-animation { animation: pulseRecord 1s infinite alternate; }
    @keyframes pulseRecord { from { transform: scale(1); } to { transform: scale(1.05); } }

    /* Botones Planos */
    .primary-button { background: #f28c28 !important; color: #2d1608 !important; border-radius: 12px !important; box-shadow: none !important; }
    .ghost-button { background: #6ea64f !important; color: #10250f !important; border-radius: 12px !important; box-shadow: none !important; }
    .mode-card, .character-card, .level-card { border-radius: 14px !important; background: #fff4d6 !important; border: 2px solid rgba(0,0,0,0.05) !important; box-shadow: none !important; }
    .mode-card[aria-pressed='true'], .character-card[aria-pressed='true'], .level-card[aria-pressed='true'] { background: #d9f0a7 !important; border-color: #6ea64f !important; }
    .level-card p { display: none !important; }

    /* Mejora Pantalla Resultados (Estética Hamster Run) */
    #gameOver .panel { background: #fff9e6 !important; color: #24140a !important; border: 4px solid #fff !important; border-top: 12px solid #f28c28 !important; text-align: center !important; }
    #gameOver .result-grid { display: grid !important; grid-template-columns: 1fr !important; gap: 12px !important; background: transparent !important; padding: 0 !important; }
    #gameOver .result-grid div { background: #fff !important; border: 2px solid rgba(0,0,0,0.04) !important; border-radius: 12px !important; padding: 12px 16px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; min-height: 52px !important; }
    
    /* Puntos (Especial) */
    #gameOver .result-grid div:first-child { flex-direction: column !important; padding: 24px 16px !important; min-height: 140px !important; gap: 4px !important; }
    #gameOver .result-grid div:first-child span { order: 1 !important; margin-bottom: 4px !important; }
    #finalScore { order: 2 !important; font-size: 3.2rem !important; font-weight: 1000 !important; line-height: 1 !important; margin: 4px 0 !important; }
    #finalScore::after { content: attr(data-rank); display: block; order: 3; font-size: 0.85rem; padding: 6px 14px; background: #f28c28; color: #2d1608; border-radius: 10px; margin-top: 10px; box-shadow: 0 4px 10px rgba(242, 140, 40, 0.2); }

    #gameOver .result-grid span { color: #7a3f16 !important; font-size: 0.65rem !important; text-transform: uppercase !important; font-weight: 900 !important; letter-spacing: 0.1em !important; }
    #gameOver .result-grid strong { color: #24140a !important; font-size: 1.2rem !important; }
    
    .new-record-label { display: block; font-size: 0.65rem; color: #f28c28; font-weight: 1000; letter-spacing: 0.12em; margin-bottom: 2px; }
    #gameOver .panel::before { display: none !important; }
    .hint { display: none !important; }
  `;
  document.head.append(style);

  installPauseMenu();
  installSelectionHeader();
  installHomeButtonsFix();
}

function installPauseMenu() {
  const PAUSE_MENU_ID = 'pauseActionMenu';
  let overlay = document.querySelector(`#${PAUSE_MENU_ID}`);
  if (overlay) return;
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
  overlay.querySelector('#pauseContinueButton')?.addEventListener('click', () => window.HamsterRunPauseControls.resume());
  overlay.querySelector('#pauseRestartButton')?.addEventListener('click', () => window.HamsterRunPauseControls.restartLevel());
  overlay.querySelector('#pauseHomeButton')?.addEventListener('click', () => window.HamsterRunPauseControls.goHome());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.mode === 'running') showPauseMenu();
    else if (e.key === 'Escape' && state.mode === 'paused') window.HamsterRunPauseControls.resume();
  });
}

export function showPauseMenu() {
  if (window.HamsterRunPauseControls.pause()) {
    const overlay = document.querySelector('#pauseActionMenu');
    if (overlay) {
      overlay.hidden = false;
      overlay.classList.add('is-visible');
      overlay.setAttribute('aria-hidden', 'false');
      overlay.querySelector('#pauseContinueButton')?.focus();
    }
  }
}

function installSelectionHeader() {
  const panel = document.querySelector('#menu .level-panel');
  if (!panel || panel.querySelector('.selection-brand')) return;
  const header = document.createElement('div');
  header.className = 'selection-brand';
  header.innerHTML = `<canvas class="selection-brand-runner" width="172" height="116"></canvas><strong class="selection-brand-title">Hamster Run</strong>`;
  panel.insertBefore(header, panel.firstElementChild);
  const canvas = header.querySelector('canvas');
  const brandCtx = canvas.getContext('2d');
  const drawBrand = (now) => {
    if (!panel.classList.contains('is-visible')) { requestAnimationFrame(drawBrand); return; }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 86 * dpr; canvas.height = 58 * dpr;
    brandCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    brandCtx.clearRect(0, 0, 86, 58);
    const frame = Math.floor(now / 110) % 4;
    brandCtx.drawImage(sprites.hamster.image, frame * 192, 0, 192, 192, 5, 2 + Math.sin(now / 130) * 2, 76, 56);
    requestAnimationFrame(drawBrand);
  };
  requestAnimationFrame(drawBrand);
}

function installHomeButtonsFix() {
  const selectors = '#newGameButton,#aboutButton,#shareButton,#startButton,#backHomeButton,#retryButton,#levelsButton';
  document.addEventListener('click', (e) => {
    const btn = e.target.closest(selectors);
    if (!btn) return;
    if (btn.id === 'aboutButton') { e.preventDefault(); e.stopImmediatePropagation(); window.alert('Toca para saltar. Doble salto disponible. Recoge nueces y corazones!'); }
    if (btn.id === 'shareButton') { e.preventDefault(); e.stopImmediatePropagation(); shareGame(btn); }
    if (btn.id === 'gameMenuButton') { e.preventDefault(); e.stopImmediatePropagation(); showPauseMenu(); }
  }, { capture: true });
}
