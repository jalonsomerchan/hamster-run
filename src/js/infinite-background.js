const BACKGROUND_MODULES = import.meta.glob('../assets/background/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const backgroundUrls = Object.values(BACKGROUND_MODULES).filter(Boolean);
const storageKey = 'hamster-run-random-background-v1';
const canvasSelector = '#game';
const state = {
  image: null,
  pattern: null,
  url: '',
  offset: 0,
  lastTime: performance.now(),
  speed: 28,
  nativeFillRect: null,
};

function pickBackgroundUrl() {
  if (!backgroundUrls.length) return '';
  const previous = sessionStorage.getItem(storageKey);
  if (previous && backgroundUrls.includes(previous)) return previous;

  const selected = backgroundUrls[Math.floor(Math.random() * backgroundUrls.length)];
  sessionStorage.setItem(storageKey, selected);
  return selected;
}

function loadBackground() {
  const url = pickBackgroundUrl();
  if (!url) return;

  state.url = url;
  state.image = new Image();
  state.image.decoding = 'async';
  state.image.onload = () => {
    state.pattern = null;
  };
  state.image.src = url;
}

function getCanvasContextPattern(ctx) {
  if (!state.image?.complete || !state.image.naturalWidth || !state.image.naturalHeight) return null;
  if (!state.pattern) {
    state.pattern = ctx.createPattern(state.image, 'repeat');
  }
  return state.pattern;
}

function updateOffset() {
  const now = performance.now();
  const dt = Math.min(0.05, Math.max(0, (now - state.lastTime) / 1000));
  state.lastTime = now;
  state.offset = (state.offset + state.speed * dt) % 4096;
}

function isGameCanvas(ctx) {
  return ctx?.canvas?.matches?.(canvasSelector);
}

function isFullCanvasFill(ctx, x, y, width, height) {
  if (!isGameCanvas(ctx)) return false;

  const canvasWidth = ctx.canvas.clientWidth || ctx.canvas.width;
  const canvasHeight = ctx.canvas.clientHeight || ctx.canvas.height;
  return x <= 2 && y <= 2 && width >= canvasWidth * 0.92 && height >= canvasHeight * 0.45;
}

function drawInfiniteBackground(ctx) {
  const pattern = getCanvasContextPattern(ctx);
  if (!pattern || !state.nativeFillRect) return false;

  const canvasWidth = ctx.canvas.clientWidth || ctx.canvas.width;
  const canvasHeight = ctx.canvas.clientHeight || ctx.canvas.height;

  updateOffset();

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = pattern;
  ctx.translate(-state.offset, 0);
  state.nativeFillRect.call(ctx, 0, 0, canvasWidth + state.image.naturalWidth + state.offset, canvasHeight);
  ctx.restore();

  return true;
}

function installCanvasBackgroundPatch() {
  if (!backgroundUrls.length || CanvasRenderingContext2D.prototype.__hamsterInfiniteBackgroundPatched) return;

  const nativeFillRect = CanvasRenderingContext2D.prototype.fillRect;
  state.nativeFillRect = nativeFillRect;
  CanvasRenderingContext2D.prototype.__hamsterInfiniteBackgroundPatched = true;

  CanvasRenderingContext2D.prototype.fillRect = function patchedFillRect(x, y, width, height) {
    if (isFullCanvasFill(this, x, y, width, height) && drawInfiniteBackground(this)) {
      return;
    }

    return nativeFillRect.call(this, x, y, width, height);
  };
}

loadBackground();
installCanvasBackgroundPatch();

window.HamsterRunBackgrounds = {
  available: backgroundUrls,
  current: () => state.url,
  shuffle() {
    sessionStorage.removeItem(storageKey);
    state.pattern = null;
    loadBackground();
  },
};
