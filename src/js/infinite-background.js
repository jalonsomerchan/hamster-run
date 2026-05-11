import background1 from '../assets/background/background1.png';
import background2 from '../assets/background/background2.png';
import background3 from '../assets/background/background3.png';
import background4 from '../assets/background/background4.png';

const backgroundUrls = [background1, background2, background3, background4];
const canvasSelector = '#game';
const state = {
  image: null,
  url: backgroundUrls[Math.floor(Math.random() * backgroundUrls.length)],
  offset: 0,
  lastTime: performance.now(),
  speed: 28,
};

function loadBackground() {
  state.image = new Image();
  state.image.decoding = 'async';
  state.image.src = state.url;
}

function updateOffset() {
  const now = performance.now();
  const dt = Math.min(0.05, Math.max(0, (now - state.lastTime) / 1000));
  state.lastTime = now;
  state.offset = (state.offset + state.speed * dt) % 100000;
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

function drawCoverTile(ctx, dx, dy, tileWidth, tileHeight) {
  const image = state.image;
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const tileRatio = tileWidth / tileHeight;
  let sx = 0;
  let sy = 0;
  let sw = image.naturalWidth;
  let sh = image.naturalHeight;

  if (imageRatio > tileRatio) {
    sw = image.naturalHeight * tileRatio;
    sx = (image.naturalWidth - sw) / 2;
  } else if (imageRatio < tileRatio) {
    sh = image.naturalWidth / tileRatio;
    sy = (image.naturalHeight - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, tileWidth, tileHeight);
}

function drawInfiniteBackground(ctx) {
  const image = state.image;
  if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return false;

  const canvasWidth = ctx.canvas.clientWidth || ctx.canvas.width;
  const canvasHeight = ctx.canvas.clientHeight || ctx.canvas.height;
  const tileHeight = canvasHeight;
  const tileWidth = Math.max(canvasWidth, image.naturalWidth * (tileHeight / image.naturalHeight));

  updateOffset();

  const startX = -((state.offset % tileWidth) + tileWidth);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  for (let x = startX; x < canvasWidth + tileWidth; x += tileWidth) {
    drawCoverTile(ctx, x, 0, tileWidth, tileHeight);
  }

  ctx.restore();

  return true;
}

function installCanvasBackgroundPatch() {
  if (CanvasRenderingContext2D.prototype.__hamsterInfiniteBackgroundPatched) return;

  const nativeFillRect = CanvasRenderingContext2D.prototype.fillRect;
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
    state.url = backgroundUrls[Math.floor(Math.random() * backgroundUrls.length)];
    loadBackground();
  },
};
