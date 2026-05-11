const GAME_CANVAS_SELECTOR = '#game';
const BACKGROUND_ASSET_RE = /(?:\/|-)background-[1-9]\b|background-[1-9][.-]/i;

function isGameCanvasContext(ctx) {
  return ctx?.canvas?.matches?.(GAME_CANVAS_SELECTOR);
}

function imageSourceOf(source) {
  if (!source) return '';
  if (typeof source === 'string') return source;
  return source.currentSrc || source.src || '';
}

function isDecorativeBackgroundImage(source) {
  return BACKGROUND_ASSET_RE.test(imageSourceOf(source));
}

function installBackgroundPropFilter() {
  const proto = CanvasRenderingContext2D.prototype;
  if (proto.__hamsterBackgroundPropsRemoved) return;

  const nativeDrawImage = proto.drawImage;
  proto.__hamsterBackgroundPropsRemoved = true;

  proto.drawImage = function drawImageWithoutBackgroundProps(image, ...args) {
    if (isGameCanvasContext(this) && isDecorativeBackgroundImage(image)) {
      return;
    }

    return nativeDrawImage.call(this, image, ...args);
  };
}

installBackgroundPropFilter();
