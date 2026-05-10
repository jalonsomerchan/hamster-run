const FIRST_EVENT_DELAY = 11;
const MIN_GAP = 13;
const MAX_GAP = 22;
const EVENT_Z_INDEX = 7;

const events = [
  {
    id: 'peanutRain',
    title: '¡Lluvia de cacahuetes!',
    detail: 'Durante unos segundos caen premios por todas partes.',
    duration: 6.5,
  },
  {
    id: 'windGust',
    title: '¡Ráfaga de viento!',
    detail: 'El salto se siente un poco más ligero.',
    duration: 7,
  },
  {
    id: 'deepNight',
    title: '¡Noche cerrada!',
    detail: 'La visibilidad baja, mantén la calma.',
    duration: 8,
  },
];

let layer = null;
let notice = null;
let peanutLayer = null;
let activeEvent = null;
let activeStartedAt = 0;
let runningSince = 0;
let nextEventAt = 0;
let lastTick = performance.now();
let frame = 0;
let windImpulseReady = true;
let lastGameVisible = false;

function nowSeconds() {
  return performance.now() / 1000;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function isOverlayVisible(id) {
  const element = document.querySelector(id);
  return Boolean(element && !element.hidden && element.classList.contains('is-visible'));
}

function isGameRunning() {
  return !isOverlayVisible('#home') && !isOverlayVisible('#menu') && !isOverlayVisible('#gameOver');
}

function ensureLayer() {
  if (layer) return;

  layer = document.createElement('div');
  layer.id = 'surpriseEventLayer';
  layer.setAttribute('aria-live', 'polite');
  layer.setAttribute('aria-atomic', 'true');
  layer.innerHTML = `
    <div id="surpriseEventNotice" class="surprise-event-notice" hidden></div>
    <div id="surprisePeanutRain" class="surprise-peanut-rain" hidden></div>
    <div id="surpriseVisibility" class="surprise-visibility" hidden></div>
  `;
  document.body.append(layer);

  notice = layer.querySelector('#surpriseEventNotice');
  peanutLayer = layer.querySelector('#surprisePeanutRain');
  injectStyles();
}

function injectStyles() {
  if (document.querySelector('#surpriseEventStyles')) return;

  const style = document.createElement('style');
  style.id = 'surpriseEventStyles';
  style.textContent = `
    #surpriseEventLayer {
      position: fixed;
      inset: 0;
      z-index: ${EVENT_Z_INDEX};
      pointer-events: none;
      overflow: hidden;
    }

    .surprise-event-notice {
      position: absolute;
      top: calc(max(74px, env(safe-area-inset-top) + 74px));
      left: 50%;
      transform: translateX(-50%);
      width: min(calc(100vw - 32px), 420px);
      border: 2px solid rgba(255, 248, 223, 0.55);
      border-radius: 999px;
      background: rgba(43, 33, 18, 0.84);
      box-shadow: 0 14px 30px rgba(12, 18, 14, 0.32);
      color: #fff8df;
      font-weight: 950;
      line-height: 1.15;
      padding: 11px 18px;
      text-align: center;
      text-shadow: 0 2px 4px rgba(0,0,0,0.26);
      animation: surpriseNotice 2.3s ease both;
      backdrop-filter: blur(10px);
    }

    .surprise-event-notice small {
      display: block;
      color: #ffe3a4;
      font-size: 0.72rem;
      font-weight: 760;
      margin-top: 3px;
    }

    @keyframes surpriseNotice {
      0% { opacity: 0; transform: translate(-50%, -12px) scale(0.96); }
      12%, 78% { opacity: 1; transform: translate(-50%, 0) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -8px) scale(0.98); }
    }

    .surprise-peanut-rain {
      position: absolute;
      inset: 0;
    }

    .surprise-peanut {
      position: absolute;
      top: -34px;
      left: var(--x);
      font-size: var(--size);
      opacity: 0.9;
      animation: peanutFall var(--fall) linear forwards;
      filter: drop-shadow(0 5px 4px rgba(80, 45, 12, 0.28));
    }

    @keyframes peanutFall {
      from { transform: translate3d(0, -32px, 0) rotate(0deg); }
      to { transform: translate3d(var(--drift), calc(100dvh + 70px), 0) rotate(420deg); }
    }

    .surprise-visibility {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 650ms ease;
      background:
        radial-gradient(circle at 50% 60%, transparent 0 24%, rgba(8, 13, 22, 0.38) 43%, rgba(4, 6, 12, 0.72) 100%),
        linear-gradient(180deg, rgba(6, 9, 20, 0.42), rgba(9, 11, 22, 0.62));
      mix-blend-mode: multiply;
    }

    .surprise-visibility.is-active {
      opacity: 1;
    }

    body.surprise-wind #game {
      animation: windSway 900ms ease-in-out infinite alternate;
    }

    @keyframes windSway {
      from { transform: translateX(-2px); }
      to { transform: translateX(3px); }
    }
  `;
  document.head.append(style);
}

function showNotice(event) {
  ensureLayer();
  notice.hidden = false;
  notice.innerHTML = `${event.title}<small>${event.detail}</small>`;
  notice.style.animation = 'none';
  notice.offsetHeight;
  notice.style.animation = '';

  window.setTimeout(() => {
    notice.hidden = true;
  }, 2350);
}

function startEvent(event) {
  if (activeEvent || !isGameRunning()) return;

  ensureLayer();
  activeEvent = event;
  activeStartedAt = nowSeconds();
  showNotice(event);

  if (event.id === 'peanutRain') startPeanutRain();
  if (event.id === 'windGust') startWind();
  if (event.id === 'deepNight') startNight();
}

function stopEvent() {
  if (!activeEvent) return;

  if (activeEvent.id === 'peanutRain') stopPeanutRain();
  if (activeEvent.id === 'windGust') stopWind();
  if (activeEvent.id === 'deepNight') stopNight();

  activeEvent = null;
  nextEventAt = nowSeconds() + randomBetween(MIN_GAP, MAX_GAP);
}

function startPeanutRain() {
  peanutLayer.hidden = false;
  peanutLayer.replaceChildren();
}

function stopPeanutRain() {
  peanutLayer.hidden = true;
  peanutLayer.replaceChildren();
}

function spawnFallingPeanut() {
  if (!peanutLayer || activeEvent?.id !== 'peanutRain') return;

  const peanut = document.createElement('span');
  peanut.className = 'surprise-peanut';
  peanut.textContent = '🥜';
  peanut.style.setProperty('--x', `${Math.random() * 100}vw`);
  peanut.style.setProperty('--size', `${18 + Math.random() * 16}px`);
  peanut.style.setProperty('--fall', `${1.7 + Math.random() * 1.2}s`);
  peanut.style.setProperty('--drift', `${-45 + Math.random() * 90}px`);
  peanutLayer.append(peanut);
  peanut.addEventListener('animationend', () => peanut.remove(), { once: true });
}

function startWind() {
  document.body.classList.add('surprise-wind');
  windImpulseReady = true;
}

function stopWind() {
  document.body.classList.remove('surprise-wind');
  windImpulseReady = true;
}

function startNight() {
  const visibility = document.querySelector('#surpriseVisibility');
  visibility.hidden = false;
  requestAnimationFrame(() => visibility.classList.add('is-active'));
}

function stopNight() {
  const visibility = document.querySelector('#surpriseVisibility');
  visibility.classList.remove('is-active');
  window.setTimeout(() => {
    if (activeEvent?.id !== 'deepNight') visibility.hidden = true;
  }, 700);
}

function resetScheduler() {
  stopEvent();
  runningSince = nowSeconds();
  nextEventAt = runningSince + FIRST_EVENT_DELAY + randomBetween(0, 4);
}

function tick() {
  const current = nowSeconds();
  const running = isGameRunning();

  if (running && !lastGameVisible) {
    resetScheduler();
  }

  if (!running && lastGameVisible) {
    stopEvent();
  }

  lastGameVisible = running;

  if (running) {
    if (activeEvent && current - activeStartedAt >= activeEvent.duration) {
      stopEvent();
    }

    if (!activeEvent && current >= nextEventAt && current - runningSince >= FIRST_EVENT_DELAY) {
      const event = events[Math.floor(Math.random() * events.length)];
      startEvent(event);
    }

    if (activeEvent?.id === 'peanutRain' && frame % 5 === 0) {
      spawnFallingPeanut();
    }
  }

  frame += 1;
  requestAnimationFrame(tick);
}

function installWindInputAssist() {
  const tryWindImpulse = () => {
    if (activeEvent?.id !== 'windGust' || !windImpulseReady || !isGameRunning()) return;

    windImpulseReady = false;
    document.body.classList.add('surprise-wind-boost');

    window.setTimeout(() => {
      windImpulseReady = true;
      document.body.classList.remove('surprise-wind-boost');
    }, 420);
  };

  window.addEventListener('pointerdown', tryWindImpulse, { passive: true, capture: true });
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') tryWindImpulse();
  }, { passive: true, capture: true });
}

ensureLayer();
installWindInputAssist();
requestAnimationFrame(tick);
