let seededRandom = null;

export function makeSeededRandom(seedText) {
  let seed = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    seed ^= seedText.charCodeAt(index);
    seed = Math.imul(seed, 16777619);
  }
  return function randomFromSeed() {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

export function setSeededRandom(rng) {
  seededRandom = rng;
}

export function getSeededRandom() {
  return seededRandom;
}

export function withModeRandom(callback) {
  if (!seededRandom) return callback();
  const nativeRandom = Math.random;
  Math.random = seededRandom;
  try {
    return callback();
  } finally {
    Math.random = nativeRandom;
  }
}
