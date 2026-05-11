const GAME_CANVAS_SELECTOR = '#game';

const LEGACY_BACKGROUND_IMAGE_RE = /\/sprites\/background\/background-[1-9]\.png(?:\?|$)|\/sprites\/environment\/environment-4\.png(?:\?|$)|background-[1-9][.-]/i;

const LEGACY_BACKGROUND_COLORS = new Set([
  '#7fd2ee',
  '#b7edc8',
  '#78c6df',
  '#f0cc8c',
  '#556fa7',
  '#77b6c9',
  '#7ec98f',
  '#4fa96f',
  '#7ab565',
  '#d7b16b',
  '#9bbb68',
  '#c7924e',
  '#668f8f',
  '#5e9b75',
  '#6d9a66',
  '#91d8ea',
  '#bcebc7',
  '#f5cb6b',
  '#8fd2e5',
  '#aee9bd',
  '#f4d16f',
  '#88cce1',
  '#9edba8',
  '#eec86a',
  '#7bc6d8',
  '#edc486',
  '#d4733e',
  '#78bfd6',
  '#e8bd78',
  '#d06b3d',
  '#6ea9c7',
  '#86c4a7',
  '#e7a947',
]);

const frameState = {
  id: 0,
  cleanedFrame: -1,
};

function isGameCanvasContext(ctx) {
  return ctx?.canvas?.matches?.(GAME_CANVAS_SELECTOR);
}

function imageSourceOf(source) {
  if (!source) return '';
  if (typeof source === 'string') return source;
  return source.currentSrc || source.src || '';
}

function normalizeCanvasStyle(value) {
  return String(value || '').trim().toLowerCase();
}

function isCanvasGradient(value) {
  return value && typeof value === 'object' && Object.prototype.toString.call(value) === '[object CanvasGradient]';
}

function isLegacyBackgroundImage(source) {
  return LEGACY_BACKGROUND_IMAGE_RE.test(imageSourceOf(source));
}

function isLegacyBackgroundPaint(ctx) {
  if (!isGameCanvasContext(ctx)) return false;
  if (isCanvasGradient(ctx.fillStyle) || isCanvasGradient(ctx.strokeStyle)) return true;

  return LEGACY_BACKGROUND_COLORS.has(normalizeCanvasStyle(ctx.fillStyle)) || LEGACY_BACKGROUND_COLORS.has(normalizeCanvasStyle(ctx.strokeStyle));
}

function isLargeLegacyRect(ctx, x, y, width, height) {
  if (!isLegacyBackgroundPaint(ctx)) return false;

  const canvasWidth = ctx.canvas.clientWidth || ctx.canvas.width;
  const canvasHeight = ctx.canvas.clientHeight || ctx.canvas.height;
  return width >= canvasWidth * 0.35 && height >= canvasHeight * 0.05 && y <= canvasHeight * 0.9;
}

function clearGameCanvas(ctx) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

function clearGameCanvasOncePerFrame(ctx) {
  if (!isGameCanvasContext(ctx)) return;
  if (frameState.cleanedFrame === frameState.id) return;

  frameState.cleanedFrame = frameState.id;
  clearGameCanvas(ctx);
}

function installFrameTracker() {
  if (window.__hamsterFrameTrackerInstalled) return;
  window.__hamsterFrameTrackerInstalled = true;

  const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (callback) => nativeRequestAnimationFrame((time) => {
    frameState.id += 1;
    frameState.cleanedFrame = -1;
    callback(time);
  });
}

function installBackgroundPropFilter() {
  const proto = CanvasRenderingContext2D.prototype;
  if (proto.__hamsterSafeBackgroundPropsRemoved) return;

  const nativeDrawImage = proto.drawImage;
  const nativeFill = proto.fill;
  const nativeStroke = proto.stroke;
  const nativeFillRect = proto.fillRect;
  proto.__hamsterSafeBackgroundPropsRemoved = true;

  proto.drawImage = function drawImageWithoutLegacyBackground(image, ...args) {
    if (isGameCanvasContext(this) && isLegacyBackgroundImage(image)) {
      return;
    }

    clearGameCanvasOncePerFrame(this);
    return nativeDrawImage.call(this, image, ...args);
  };

  proto.fill = function fillWithoutLegacyBackground(...args) {
    if (isLegacyBackgroundPaint(this)) {
      clearGameCanvasOncePerFrame(this);
      return;
    }

    clearGameCanvasOncePerFrame(this);
    return nativeFill.apply(this, args);
  };

  proto.stroke = function strokeWithoutLegacyBackground(...args) {
    if (isLegacyBackgroundPaint(this)) {
      return;
    }

    clearGameCanvasOncePerFrame(this);
    return nativeStroke.apply(this, args);
  };

  proto.fillRect = function fillRectWithoutLegacyBackground(x, y, width, height) {
    if (isLargeLegacyRect(this, x, y, width, height)) {
      clearGameCanvasOncePerFrame(this);
      return;
    }

    clearGameCanvasOncePerFrame(this);
    return nativeFillRect.call(this, x, y, width, height);
  };
}

installFrameTracker();
installBackgroundPropFilter();
