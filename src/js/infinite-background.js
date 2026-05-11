import background1 from '../assets/background/background1.png';
import background2 from '../assets/background/background2.png';
import background3 from '../assets/background/background3.png';
import background4 from '../assets/background/background4.png';

const backgroundUrls = [background1, background2, background3, background4];
const canvasSelector = '#game';
const state = {
  url: backgroundUrls[Math.floor(Math.random() * backgroundUrls.length)],
  offset: 0,
  lastTime: performance.now(),
  speed: 28,
  animationId: 0,
};

function gameCanvas() {
  return document.querySelector(canvasSelector);
}

function applyCanvasCssBackground() {
  const canvas = gameCanvas();
  if (!canvas) return;

  canvas.style.backgroundImage = `url("${state.url}")`;
  canvas.style.backgroundRepeat = 'repeat-x';
  canvas.style.backgroundSize = 'auto 100%';
  canvas.style.backgroundPosition = `${-Math.round(state.offset)}px 0`;
  canvas.style.backgroundColor = 'transparent';
}

function tickBackground() {
  const now = performance.now();
  const dt = Math.min(0.05, Math.max(0, (now - state.lastTime) / 1000));
  state.lastTime = now;
  state.offset = (state.offset + state.speed * dt) % 100000;
  applyCanvasCssBackground();
  state.animationId = requestAnimationFrame(tickBackground);
}

function startBackground() {
  applyCanvasCssBackground();
  if (!state.animationId) {
    state.lastTime = performance.now();
    state.animationId = requestAnimationFrame(tickBackground);
  }
}

startBackground();

window.HamsterRunBackgrounds = {
  available: backgroundUrls,
  current: () => state.url,
  shuffle() {
    state.url = backgroundUrls[Math.floor(Math.random() * backgroundUrls.length)];
    applyCanvasCssBackground();
  },
};
