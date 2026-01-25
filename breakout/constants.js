// breakout/constants.js
// Game constants and configuration values

// === CANVAS & LAYOUT ===
export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 650;

// === PADDLE ===
export const PADDLE_WIDTH = 120;
export const PADDLE_HEIGHT = 16;
export const PADDLE_OFFSET_BOTTOM = 25;

// === BALL ===
export const BALL_RADIUS = 10;

// === BRICKS ===
// Bricks: 12*68 + 11*4 = 816 + 44 = 860, centered in 900
export const BRICK_ROWS = 6;
export const BRICK_COLS = 12;
export const BRICK_WIDTH = 68;
export const BRICK_HEIGHT = 24;
export const BRICK_PADDING = 4;
export const BRICK_OFFSET_TOP = 70;
export const BRICK_OFFSET_LEFT = 20; // (900 - 860) / 2

// === PLAYER MECHANICS ===
export const DASH_SPEED = 35;
export const DASH_COOLDOWN = 800;
export const TEDDY_METER_MAX = 100;
export const KEYBOARD_SPEED = 12;

// === PROGRESSION ===
export const MAX_LEVELS = 12;
export const STARS_TO_UNLOCK = 10; // Stars needed to unlock next enemy
export const POINTS_PER_STAR = 200; // Score needed per star (2000 total to fully complete an enemy)

// === INVASION MODE ===
export const CHARGE_TIME_PER_LEVEL = 400; // ms to charge each level
export const SHIP_FIRE_COOLDOWN = 320; // ms between shots (faster player shooting)
export const INVASION_BALL_SPEED = 9; // Speed of invasion balls
export const ALIEN_SHOT_COOLDOWN = 800; // ms between alien shots
export const DIVE_SPAWN_COOLDOWN = 3000; // ms between dive attacks

// === PIXEL ART SPRITES (CC0 from Superpowers Asset Pack) ===
export const SPRITES = {
  // Player ships
  ship1: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/1.png',
  ship2: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/2.png',
  ship3: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/3.png',
  ship4: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/4.png',
  ship5: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/5.png',
  // Projectiles
  shot1: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/shots/1.png',
  shot2: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/shots/2.png',
  shot3: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/shots/3.png',
  shot4: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/shots/4.png',
  // Effects
  fx1: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/effects/fx-1.png',
  fx2: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/effects/fx-2.png',
  fx3: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/effects/fx-3.png',
  shield1: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/effects/shield-1.png',
  shield2: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/effects/shield-2.png',
  // Power-ups
  powerUp1: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/items/power-up-1.png',
  powerUp2: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/items/power-up-2.png',
  powerUp3: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/items/power-up-3.png',
  gem1: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/items/gem-1.png',
  gem2: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/items/gem-2.png',
  bomb: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/items/bomb.png',
  rocket: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/items/rocket-1.png',
  // Enemy ships (using different ships as enemies)
  enemy1: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/6.png',
  enemy2: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/7.png',
  enemy3: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/8.png',
  enemy4: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/9.png',
  enemy5: 'https://raw.githubusercontent.com/sparklinlabs/superpowers-asset-packs/master/space-shooter/ships/10.png',
};
