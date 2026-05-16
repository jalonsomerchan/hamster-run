import hamsterSheet from '../../assets/sprites/hamster/sheet-transparent.png';
import blueHamsterSheet from '../../assets/sprites/characters/blue-hamster/sheet-transparent.png';
import tasmanianSheet from '../../assets/sprites/characters/tasmanian/sheet-transparent.png';
import hamsterAngelSheet from '../../assets/sprites/death/hamster-angel/sheet-transparent.png';
import blueHamsterAngelSheet from '../../assets/sprites/death/blue-hamster-angel/sheet-transparent.png';
import tasmanianAngelSheet from '../../assets/sprites/death/tasmanian-angel/sheet-transparent.png';
import peanutSheet from '../../assets/sprites/peanut/sheet-transparent.png';
import heartSheet from '../../assets/sprites/heart/sheet-transparent.png';
import enemySheet from '../../assets/sprites/enemy/sheet-transparent.png';
import groundEnemySheet from '../../assets/sprites/enemies/ground/sheet-transparent.png';
import flyingEnemySheet from '../../assets/sprites/enemies/flying/sheet-transparent.png';
import chestnutEnemySheet from '../../assets/sprites/enemies/chestnut/sheet-transparent.png';
import mushroomHopperSheet from '../../assets/sprites/enemies/mushroom-hopper/sheet-transparent.png';
import acornBatSheet from '../../assets/sprites/enemies/acorn-bat/sheet-transparent.png';
import platformWoodLong from '../../assets/sprites/platforms/platform-1.png';
import platformWoodMedium from '../../assets/sprites/platforms/platform-2.png';
import platformWoodShort from '../../assets/sprites/platforms/platform-3.png';
import platformDirt from '../../assets/sprites/platforms/platform-4.png';
import platformStraw from '../../assets/sprites/platforms/platform-5.png';
import platformMushroom from '../../assets/sprites/platforms/platform-6.png';
import cloudSprite from '../../assets/sprites/background/background-1.png';
import treeSprite from '../../assets/sprites/background/background-2.png';
import hillSprite from '../../assets/sprites/background/background-3.png';
import barnSprite from '../../assets/sprites/background/background-4.png';
import moonSprite from '../../assets/sprites/background/background-5.png';
import haySprite from '../../assets/sprites/background/background-6.png';
import thistleSprite from '../../assets/sprites/environment/environment-3.png';
import grassSprite from '../../assets/sprites/environment/environment-4.png';

export function makeImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

export const platformAssets = [
  { image: makeImage(platformWoodLong), crop: [10, 91, 238, 73], cap: 52, minWidth: 170 },
  { image: makeImage(platformWoodMedium), crop: [31, 90, 194, 76], cap: 46, minWidth: 160 },
  { image: makeImage(platformWoodShort), crop: [54, 95, 148, 66], cap: 38, minWidth: 132 },
  { image: makeImage(platformDirt), crop: [15, 88, 226, 79], cap: 50, minWidth: 170 },
  { image: makeImage(platformStraw), crop: [23, 91, 212, 74], cap: 50, minWidth: 168 },
  { image: makeImage(platformMushroom), crop: [49, 93, 158, 69], cap: 42, minWidth: 138 },
];

export const backgroundAssets = [
  { image: makeImage(cloudSprite), crop: [27, 64, 202, 128], lane: 'sky' },
  { image: makeImage(treeSprite), crop: [59, 46, 138, 163], lane: 'horizon' },
  { image: makeImage(hillSprite), crop: [20, 83, 215, 90], lane: 'ground' },
  { image: makeImage(barnSprite), crop: [15, 70, 225, 116], lane: 'horizon' },
  { image: makeImage(moonSprite), crop: [57, 63, 142, 130], lane: 'sky' },
  { image: makeImage(haySprite), crop: [30, 57, 195, 141], lane: 'ground' },
];

export const sprites = {
  hamster: { image: makeImage(hamsterSheet), cols: 4, rows: 1, cell: 192 },
  blueHamster: { image: makeImage(blueHamsterSheet), cols: 4, rows: 1, cell: 192 },
  tasmanian: { image: makeImage(tasmanianSheet), cols: 4, rows: 1, cell: 192 },
  hamsterAngel: { image: makeImage(hamsterAngelSheet), cols: 4, rows: 1, cell: 192 },
  blueHamsterAngel: { image: makeImage(blueHamsterAngelSheet), cols: 4, rows: 1, cell: 192 },
  tasmanianAngel: { image: makeImage(tasmanianAngelSheet), cols: 4, rows: 1, cell: 192 },
  peanut: { image: makeImage(peanutSheet), cols: 2, rows: 2, cell: 128 },
  heart: { image: makeImage(heartSheet), cols: 2, rows: 2, cell: 128 },
  enemy: { image: makeImage(enemySheet), cols: 4, rows: 1, cell: 168 },
  groundEnemy: { image: makeImage(groundEnemySheet), cols: 4, rows: 1, cell: 168 },
  flyingEnemy: { image: makeImage(flyingEnemySheet), cols: 4, rows: 1, cell: 168 },
  chestnutEnemy: { image: makeImage(chestnutEnemySheet), cols: 4, rows: 1, cell: 168 },
  mushroomHopper: { image: makeImage(mushroomHopperSheet), cols: 4, rows: 1, cell: 168 },
  acornBat: { image: makeImage(acornBatSheet), cols: 4, rows: 1, cell: 168 },
  platforms: platformAssets,
  background: backgroundAssets,
  thistle: makeImage(thistleSprite),
  grass: makeImage(grassSprite),
};
