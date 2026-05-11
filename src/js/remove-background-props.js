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
]);

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

function isDecorativeBackgroundImage(source) {
  return DECORATIVE_IMAGE_RE.test(imageSourceOf(source));
}

function isOldBackgroundFill(ctx) {
  if (!isGameCanvasContext(ctx)) return false;
  if (typeof ctx.fillStyle !== 'string') return false;
  return OLD_BACKGROUND_FILL_COLORS.has(normalizeColor(ctx.fillStyle));
}

function installBackgroundPropFilter() {
  const proto = CanvasRenderingContext2D.prototype;
  if (proto.__hamsterBackgroundPropsRemoved) return;

  const nativeDrawImage = proto.drawImage;
  const nativeFill = proto.fill;
  proto.__hamsterBackgroundPropsRemoved = true;

  proto.drawImage = function drawImageWithoutBackgroundProps(image, ...args) {
    if (isGameCanvasContext(this) && isDecorativeBackgroundImage(image)) {
      return;
    }

    return nativeDrawImage.call(this, image, ...args);
  };

  proto.fill = function fillWithoutOldBackground(...args) {
    if (isOldBackgroundFill(this)) {
      return;
    }

    return nativeFill.apply(this, args);
  };
}

installBackgroundPropFilter();
