// breakout/gameLogic.js
// Core game mechanics - pure functions for game logic

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_OFFSET_BOTTOM,
  BALL_RADIUS,
  BRICK_COLS,
  BRICK_WIDTH,
  BRICK_HEIGHT,
  BRICK_PADDING,
  BRICK_OFFSET_TOP,
  BRICK_OFFSET_LEFT,
} from './constants.js';

import {
  ENEMY_THEME_COLORS,
  LEVEL_DEFINITIONS,
  DEFAULT_LEVEL,
  enemyDefs,
  powerUpTypes,
} from './data.js';

// === UNIQUE ID GENERATOR ===
let _idCounter = 0;
export const uid = () => `${Date.now()}-${_idCounter++}`;

// === DIFFICULTY SCALING SYSTEM ===
// Global level = enemyIndex * 10 + levelNumber (1-100)
export const getDifficulty = (enemyIndex, level) => {
  const globalLevel = enemyIndex * 10 + level;
  const t = (globalLevel - 1) / 99; // 0 to 1 progression

  return {
    globalLevel,
    ballSpeed: 7 + t * 8,                    // 7 -> 15
    brickHealthBonus: Math.floor(t * 6),     // 0 -> 6
    basePaddleWidth: 120 - t * 40,           // 120 -> 80
    powerUpChance: 0.15 - t * 0.10,          // 15% -> 5%
    enemyCount: Math.floor(1 + t * 5),       // 1 -> 6
    enemySpeed: 1 + t * 2,                   // 1 -> 3 multiplier
    enemySpawnRate: 8000 - t * 5000,         // 8s -> 3s between spawns
  };
};

// === BRICK HEALTH TIERS ===
export const healthTiers = [
  { minHealth: 10, color: '#505050', name: 'steel' },    // Dark grey steel
  { minHealth: 8, color: '#6a5acd', name: 'purple' },    // Purple
  { minHealth: 6, color: '#4080e0', name: 'blue' },      // Blue
  { minHealth: 4, color: '#50c878', name: 'green' },     // Green/Lime
  { minHealth: 2, color: '#ffa500', name: 'orange' },    // Orange
  { minHealth: 1, color: '#ff6b6b', name: 'red' },       // Red
];

// Get color for a given health value
export const getColorForHealth = (health) => {
  for (const tier of healthTiers) {
    if (health >= tier.minHealth) return tier.color;
  }
  return '#ff6b6b'; // Default red for 1 health
};

// Get which tier a health value belongs to
export const getHealthTier = (health) => {
  for (let i = 0; i < healthTiers.length; i++) {
    if (health >= healthTiers[i].minHealth) return i;
  }
  return healthTiers.length - 1;
};

// === PORTAL COLORS ===
export const PORTAL_COLORS = [
  { primary: '#4488ff', secondary: '#88bbff' }, // Blue
  { primary: '#ff8844', secondary: '#ffbb88' }, // Orange
  { primary: '#44ff88', secondary: '#88ffbb' }, // Green
  { primary: '#ff44ff', secondary: '#ff88ff' }, // Purple
];

// === BRICK CREATION ===
// Create brick layout from hand-crafted level definitions
// Returns { bricks, bumpers, portals, spawners }
export const createBricksData = (level, enemy) => {
  const newBricks = [];
  const newBumpers = [];
  const newPortals = [];
  const newSpawners = [];
  const portalPairs = {}; // Track portal pairs by number

  const enemyId = enemy?.id || 'brick_goblin';
  const themeColor = ENEMY_THEME_COLORS[enemyId] || ENEMY_THEME_COLORS.brick_goblin;

  // Get level definition for this enemy
  const enemyLevels = LEVEL_DEFINITIONS[enemyId] || LEVEL_DEFINITIONS.brick_goblin;
  const levelIndex = Math.min(level - 1, enemyLevels.length - 1);
  const levelDef = enemyLevels[levelIndex] || DEFAULT_LEVEL;

  // Global difficulty scaling (1-100)
  const enemyIndex = enemyDefs.findIndex(e => e.id === enemyId) || 0;
  const diff = getDifficulty(enemyIndex, level);
  const healthBonus = diff.brickHealthBonus;

  for (let row = 0; row < levelDef.length; row++) {
    const rowStr = levelDef[row];
    for (let col = 0; col < rowStr.length && col < BRICK_COLS; col++) {
      const char = rowStr[col];
      if (char === '.') continue; // Empty space

      const x = BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING);
      const y = BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING);
      const centerX = x + BRICK_WIDTH / 2;
      const centerY = y + BRICK_HEIGHT / 2;

      // === PINBALL FEATURES ===

      // Bumper (O)
      if (char === 'O') {
        newBumpers.push({
          id: `bumper-${row}-${col}`,
          x: centerX,
          y: centerY,
          radius: 18,
          active: true,
          hitTimer: 0, // For hit animation
          points: 25,
          color: themeColor.primary,
        });
        continue;
      }

      // Portal (@1, @2, @3, @4 - pairs)
      if (char === '@') {
        // Check next char for pair number
        const nextChar = col + 1 < rowStr.length ? rowStr[col + 1] : '1';
        const pairNum = parseInt(nextChar) || 1;
        const pairIndex = Math.min(pairNum - 1, 3);

        const portal = {
          id: `portal-${row}-${col}`,
          x: centerX,
          y: centerY,
          radius: 20,
          pairId: pairNum,
          colors: PORTAL_COLORS[pairIndex],
          animPhase: Math.random() * Math.PI * 2,
          cooldown: 0, // Prevent instant re-teleport
        };

        newPortals.push(portal);

        // Track pairs
        if (!portalPairs[pairNum]) portalPairs[pairNum] = [];
        portalPairs[pairNum].push(portal);
        continue;
      }

      // Portal pair number (skip, handled above)
      if ('1234'.includes(char) && col > 0 && rowStr[col-1] === '@') {
        continue;
      }

      // Spawner (S)
      if (char === 'S') {
        newSpawners.push({
          id: `spawner-${row}-${col}`,
          x: x,
          y: y,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          health: 3 + Math.floor(level / 10), // 3-5 hits based on level
          maxHealth: 3 + Math.floor(level / 10),
          lastSpawn: Date.now(),
          spawnInterval: 6000 - level * 30, // 6s down to 3s
          shakeAmount: 0,
          color: themeColor.primary,
        });
        continue;
      }

      // === BRICKS ===
      let health, type, color, specificPowerUp = null;

      switch (char) {
        case '1': // 1-hit brick
          health = 1 + healthBonus;
          type = 'normal';
          break;
        case '2': // 2-hit brick
          health = 2 + healthBonus;
          type = 'normal';
          break;
        case '3': // 3-hit brick (strong)
          health = 3 + healthBonus;
          type = 'normal';
          break;
        case '4': // 4-hit brick (very strong)
          health = 4 + healthBonus;
          type = 'normal';
          break;
        case '5': // 5-hit brick (ultra strong)
          health = 5 + healthBonus;
          type = 'normal';
          break;
        case '#': // Indestructible obstacle
          health = 9999;
          type = 'obstacle';
          break;
        case '*': // Random power-up brick
          health = 1 + healthBonus;
          type = 'powerup';
          break;
        case 'X': // Explosive brick
          health = 1;
          type = 'explosive';
          break;
        case 'F': // Frozen brick - must crack ice first, then destroy
          health = 2;
          type = 'frozen';
          break;
        case 'P': // sPlit brick - breaks into 4 mini-bricks
          health = 1;
          type = 'split';
          break;
        case 'E': // Enemy spawner - spawns enemies when hit, distinct look
          health = 3 + Math.floor(healthBonus / 2); // Contains this many enemies
          type = 'spawner';
          break;
        // === SPECIFIC POWERUP BRICKS ===
        case 'e': // Expand powerup brick
          health = 1 + healthBonus;
          type = 'powerup_specific';
          specificPowerUp = 'expand';
          break;
        case 'k': // shrinK powerup brick
          health = 1 + healthBonus;
          type = 'powerup_specific';
          specificPowerUp = 'shrink';
          break;
        case 'm': // Multi-ball powerup brick
          health = 1 + healthBonus;
          type = 'powerup_specific';
          specificPowerUp = 'multi';
          break;
        case 'f': // Fast powerup brick
          health = 1 + healthBonus;
          type = 'powerup_specific';
          specificPowerUp = 'fast';
          break;
        case 's': // Slow powerup brick
          health = 1 + healthBonus;
          type = 'powerup_specific';
          specificPowerUp = 'slow';
          break;
        case 'l': // Life powerup brick
          health = 1 + healthBonus;
          type = 'powerup_specific';
          specificPowerUp = 'life';
          break;
        case 'z': // laZer powerup brick
          health = 1 + healthBonus;
          type = 'powerup_specific';
          specificPowerUp = 'laser';
          break;
        case 'h': // sHield powerup brick
          health = 1 + healthBonus;
          type = 'powerup_specific';
          specificPowerUp = 'shield';
          break;
        case 'g': // maGnet powerup brick
          health = 1 + healthBonus;
          type = 'powerup_specific';
          specificPowerUp = 'magnet';
          break;
        case 'M': // Mega ball powerup brick
          health = 1 + healthBonus;
          type = 'powerup_specific';
          specificPowerUp = 'mega';
          break;
        case 'w': // Warp powerup brick
          health = 1 + healthBonus;
          type = 'powerup_specific';
          specificPowerUp = 'warp';
          break;
        // === WEAPON BRICKS ===
        case 'B': // Bubble Wand weapon brick
          health = 2 + healthBonus;
          type = 'weapon';
          specificPowerUp = 'weapon_bubble';
          break;
        case 'A': // gravity Anchor weapon brick
          health = 2 + healthBonus;
          type = 'weapon';
          specificPowerUp = 'weapon_anchor';
          break;
        case 'R': // pRism beam weapon brick
          health = 2 + healthBonus;
          type = 'weapon';
          specificPowerUp = 'weapon_prism';
          break;
        case 'V': // Vine launcher weapon brick
          health = 2 + healthBonus;
          type = 'weapon';
          specificPowerUp = 'weapon_vine';
          break;
        case 'W': // echo Wave weapon brick
          health = 2 + healthBonus;
          type = 'weapon';
          specificPowerUp = 'weapon_echo';
          break;
        default:
          continue; // Unknown character, skip
      }

      // Cap health
      health = Math.min(health, 12);

      // Determine color based on type and specific powerup
      if (type === 'obstacle') {
        color = '#2a2a4e';
      } else if (type === 'explosive') {
        color = '#ff4400';
      } else if (type === 'powerup') {
        color = '#ffd700';
      } else if (type === 'powerup_specific' && specificPowerUp && powerUpTypes[specificPowerUp]) {
        color = powerUpTypes[specificPowerUp].color;
      } else if (type === 'weapon' && specificPowerUp && powerUpTypes[specificPowerUp]) {
        color = powerUpTypes[specificPowerUp].color;
      } else if (type === 'frozen') {
        color = '#88ddff'; // Icy blue
      } else if (type === 'split') {
        color = '#aa66cc'; // Purple
      } else if (type === 'spawner') {
        color = '#44aa44'; // Green (enemy color)
      } else {
        color = getColorForHealth(health);
      }

      // Invisible bricks for Shadow Smith
      const invisChance = enemy?.gimmick === 'invisible_bricks' ? Math.min(0.15 + level * 0.03, 0.4) : 0;
      const isInvisible = type === 'normal' && Math.random() < invisChance;

      newBricks.push({
        id: `${row}-${col}`,
        x, y,
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        health,
        maxHealth: health,
        type,
        color,
        invisible: isInvisible,
        canRegenerate: enemy?.gimmick === 'regenerating_bricks' && type === 'normal' && Math.random() < 0.15,
        // New brick type properties
        cracked: false, // For frozen bricks - becomes true after first hit
        enemiesRemaining: type === 'spawner' ? health : 0, // For spawner bricks
        // Specific powerup for powerup_specific and weapon types
        specificPowerUp: specificPowerUp,
      });
    }
  }

  // Link portal pairs
  newPortals.forEach(portal => {
    const pair = portalPairs[portal.pairId];
    if (pair && pair.length === 2) {
      const other = pair.find(p => p.id !== portal.id);
      if (other) portal.linkedPortalId = other.id;
    }
  });

  return { bricks: newBricks, bumpers: newBumpers, portals: newPortals, spawners: newSpawners };
};

// === BALL CREATION ===
// Create a new ball with proper initial velocity
export const createBallData = (level = 1, enemyIndex = 0, paddleX = null, paddleWidth = PADDLE_WIDTH) => {
  const diff = getDifficulty(enemyIndex, level);
  const totalSpeed = diff.ballSpeed;

  // Use provided paddle position or default to center
  const ballX = paddleX !== null ? paddleX + paddleWidth / 2 : CANVAS_WIDTH / 2;

  return {
    id: uid(),
    x: ballX,
    y: CANVAS_HEIGHT - PADDLE_HEIGHT - PADDLE_OFFSET_BOTTOM - BALL_RADIUS,
    vx: (Math.random() - 0.5) * 8,
    vy: -totalSpeed,
    attached: true,
    burning: false,
    baseSpeed: totalSpeed,
  };
};
