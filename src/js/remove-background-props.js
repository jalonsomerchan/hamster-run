const GAME_CANVAS_SELECTOR = '#game';

// Sprites decorativos del fondo antiguo. No incluye plataformas, enemigos ni coleccionables.
const DECORATIVE_IMAGE_RE = /(?:\/|-)background-[1-9]\b|background-[1-9][.-]|environment-4[.-]/i;

// Colores usados por las colinas/suelo dibujados a mano en el fondo antiguo.
const OLD_BACKGROUND_FILL_COLORS = new Set([
  '#7ec98f',
  '#4fa96f',
  '#7ab565',
  '#d7b16b',
  '#9bbb68',
  '#c7924e',
  '#668f8f',
  '#5e9b75',
  '#6d9a66',
  '#86c4a7',
  '#9edba8',
  '#aee9bd',
  '#bcebc7',
  '#91d8ea',
  '#7fd2ee',
  '#b7edc8',
  '#78c6df',
  '#f0cc8c',
  '#556fa7',
  '#77b6c9',
  '#f5cb6b',
]);

const LEGACY_BACKGROUND_COLOR_RE = /(?:rgb\(\s*(?:7[0-9]|8[0-9]|9[0-9]|1[0-9]{2}|2[0-2][0-9])\s*,\s*(?:1[2-9][0-9]|2[0-5][0-9])\s*,\s*(?:6[0-9]|7[0-9]|8[0-9]|9[0-9]|1[0-9]{2}|2[0-5][0-9])\s*\)|rgba\(\s*(?:7[0-9]|8[0-9]|9[0-9]|1[0-9]{2}|2[0-2][0-9])\s*,\s*(?:1[2-9][0-9]|2[0-5][0-9])\s*,\s*(?:6[0-9]|7[0-9]|8[0-9]|9[0-9]|1[0-9]{2}|2[0-5][0-9])\s*,)/i;

function isGameCanvasContext(ctx) {
  return ctx?.canvas?.matches?.(GAME_CANVAS_SELECTOR);
}

function imageSourceOf(source) {
  if (!source) return '';
  if (typeof source === 'string') return source;
  return source.currentSrc || source.src || '';
}

function normalizeColor(value) {
  return String(value || '').trim().toLowerCase();
}

function isCanvasGradient(value) {
  return value && typeof value === 'object' && Object.prototype.toString.call(value) === '[object CanvasGradient]';
}

function isDecorativeBackgroundImage(source) {
  const src = imageSourceOf(source);
  if (DECORATIVE_IMAGE_RE.test(src)) return true;

  // Los sprites del fondo antiguo son tiles pequeños de 256x256. Se filtran solo
  // cuando se dibujan en la parte alta/media del canvas; no afecta a plataformas.
  return source?.naturalWidth === 256 && source?.naturalHeight === 256;
}

function isLegacyBackgroundStyle(value) {
  if (isCanvasGradient(value)) return true;
  if (typeof value !== 'string') return false;

  const color = normalizeColor(value);
  return OLD_BACKGROUND_FILL_COLORS.has(color) || LEGACY_BACKGROUND_COLOR_RE.test(color);
}

function isOldBackgroundPaint(ctx) {
  if (!isGameCanvasContext(ctx)) return false;
  return isLegacyBackgroundStyle(ctx.fillStyle) || isLegacyBackgroundStyle(ctx.strokeStyle);
}

function isLegacySkyOrGroundRect(ctx, x, y, width, height) {
  if (!isGameCanvasContext(ctx)) return false;

  const canvasWidth = ctx.canvas.clientWidth || ctx.canvas.width;
  const canvasHeight = ctx.canvas.clientHeight || ctx.canvas.height;
  const isWide = width >= canvasWidth * 0.4;
  const isTall = height >= canvasHeight * 0.06;
  const isBackgroundArea = y <= canvasHeight * 0.88;

  return isWide && isTall && isBackgroundArea && isLegacyBackgroundStyle(ctx.fillStyle);
}

function isDecorativeDrawImage(ctx, image, args) {
  if (!isGameCanvasContext(ctx) || !isDecorativeBackgroundImage(image)) return false;

  const canvasHeight = ctx.canvas.clientHeight || ctx.canvas.height;
  const destinationY = args.length >= 8 ? Number(args[5]) : Number(args[1]);
  const destinationHeight = args.length >= 8 ? Number(args[7]) : Number(args[3] || image?.naturalHeight || 0);

  // Evita quitar accidentalmente un sprite jugable: solo bloquea imágenes de fondo
  // colocadas como paisaje, no cosas dibujadas en la zona baja de juego.
  return destinationY < canvasHeight * 0.88 || destinationHeight > canvasHeight * 0.12;
}

function installBackgroundPropFilter() {
  const proto = CanvasRenderingContext2D.prototype;
  if (proto.__hamsterBackgroundPropsRemoved) return;

  const nativeDrawImage = proto.drawImage;
  const nativeFill = proto.fill;
  const nativeStroke = proto.stroke;
  const nativeFillRect = proto.fillRect;
  proto.__hamsterBackgroundPropsRemoved = true;

  proto.drawImage = function drawImageWithoutBackgroundProps(image, ...args) {
    if (isDecorativeDrawImage(this, image, args)) {
      return;
    }

    return nativeDrawImage.call(this, image, ...args);
  };

  proto.fill = function fillWithoutOldBackground(...args) {
    if (isOldBackgroundPaint(this)) {
      return;
    }

    return nativeFill.apply(this, args);
  };

  proto.stroke = function strokeWithoutOldBackground(...args) {
    if (isOldBackgroundPaint(this)) {
      return;
    }

    return nativeStroke.apply(this, args);
  };

  proto.fillRect = function fillRectWithoutOldBackground(x, y, width, height) {
    if (isLegacySkyOrGroundRect(this, x, y, width, height)) {
      return;
    }

    return nativeFillRect.call(this, x, y, width, height);
  };
}

installBackgroundPropFilter();
