export function random(min, max) {
  return min + Math.random() * (max - min);
}

export function randomInt(min, max) {
  return Math.floor(random(min, max + 1));
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(min, max, amount) {
  return min + (max - min) * amount;
}

export function lerpRange(startRange, endRange, amount) {
  return [lerp(startRange[0], endRange[0], amount), lerp(startRange[1], endRange[1], amount)];
}
