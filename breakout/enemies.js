// breakout/enemies.js
// Enemy system - pure functions for enemy spawning and behavior

import {
  CANVAS_WIDTH,
} from './constants.js';

import {
  ENEMY_SPRITES,
  ENEMY_THEME_COLORS,
} from './data.js';

import { uid } from './gameLogic.js';

// === ENEMY TIER SYSTEM ===
export const TIER_ENEMIES = {
  1: ['rat', 'kobold', 'goblin', 'skeleton'],
  2: ['zombie', 'orc', 'spider', 'harpy'],
  3: ['mimic', 'owlbear', 'cube', 'troll'],
  4: ['werewolf', 'basilisk', 'beholder', 'mindflayer'],
  5: ['vampire', 'dragon', 'lich', 'tarrasque'],
};

// Determine max tier based on difficulty (globalLevel 1-100)
export const getMaxTier = (globalLevel) => {
  if (globalLevel >= 80) return 5;
  if (globalLevel >= 60) return 4;
  if (globalLevel >= 40) return 3;
  if (globalLevel >= 20) return 2;
  return 1;
};

// Roll for enemy tier - higher tiers are rarer
export const rollEnemyTier = (maxTier) => {
  const tierRoll = Math.random();
  if (maxTier >= 5 && tierRoll < 0.05) return 5;
  if (maxTier >= 4 && tierRoll < 0.15) return 4;
  if (maxTier >= 3 && tierRoll < 0.30) return 3;
  if (maxTier >= 2 && tierRoll < 0.50) return 2;
  return 1;
};

// === ENEMY CREATION ===
// Create enemy data object (pure function)
export const createEnemyData = (difficulty, selectedEnemyId = 'brick_goblin') => {
  if (!difficulty) return null;

  const maxTier = getMaxTier(difficulty.globalLevel);
  const tier = rollEnemyTier(maxTier);

  // Pick random enemy from tier
  const tierPool = TIER_ENEMIES[tier];
  const type = tierPool[Math.floor(Math.random() * tierPool.length)];

  const sprite = ENEMY_SPRITES[type];
  if (!sprite) {
    console.warn('Unknown enemy type:', type);
    return null;
  }

  const themeColors = ENEMY_THEME_COLORS[selectedEnemyId] || ENEMY_THEME_COLORS.brick_goblin;

  // Spawn position - from top or sides
  const side = Math.random();
  let x, y, vx, vy;
  const size = sprite.width * sprite.scale;

  // Behavior-specific spawn patterns
  const behavior = sprite.behavior || 'bounce';

  if (behavior === 'swoop' || behavior === 'soar') {
    // Flying enemies spawn from top corners
    x = Math.random() < 0.5 ? 50 : CANVAS_WIDTH - 50 - size;
    y = -size;
    vx = x < CANVAS_WIDTH / 2 ? 1 * difficulty.enemySpeed : -1 * difficulty.enemySpeed;
    vy = 0.5 * difficulty.enemySpeed;
  } else if (behavior === 'crawl') {
    // Crawlers spawn from sides
    const fromLeft = Math.random() < 0.5;
    x = fromLeft ? -size : CANVAS_WIDTH + size;
    y = 50 + Math.random() * 150;
    vx = fromLeft ? 0.8 * difficulty.enemySpeed : -0.8 * difficulty.enemySpeed;
    vy = 0.2 * difficulty.enemySpeed;
  } else if (side < 0.6) {
    // Top spawn
    x = 100 + Math.random() * (CANVAS_WIDTH - 200);
    y = -size;
    vx = (Math.random() - 0.5) * 2 * difficulty.enemySpeed;
    vy = (0.5 + Math.random() * 0.5) * difficulty.enemySpeed;
  } else if (side < 0.8) {
    // Left spawn
    x = -size;
    y = 100 + Math.random() * 200;
    vx = (0.5 + Math.random() * 0.5) * difficulty.enemySpeed;
    vy = (Math.random() - 0.5) * difficulty.enemySpeed;
  } else {
    // Right spawn
    x = CANVAS_WIDTH + size;
    y = 100 + Math.random() * 200;
    vx = -(0.5 + Math.random() * 0.5) * difficulty.enemySpeed;
    vy = (Math.random() - 0.5) * difficulty.enemySpeed;
  }

  return {
    id: uid(),
    type,
    tier,
    behavior: sprite.behavior || 'bounce',
    special: sprite.special,
    x, y, vx, vy,
    health: sprite.health,
    maxHealth: sprite.health,
    frame: 0,
    frameTimer: 0,
    width: size,
    height: size,
    themeColors,
    phaseTimer: 0,
    isPhased: false,
    // Special state for unique abilities
    hasRevived: false, // For zombie
    enraged: false, // For orc, werewolf
    disguised: sprite.special === 'disguise', // For mimic
    regenTimer: 0, // For troll
    lastSpecialTime: 0, // For abilities with cooldowns
    confused: false, // Confused state (for mind flayer)
    petrified: false, // Petrified state (for basilisk)
  };
};

// === ENEMY BEHAVIOR CALCULATIONS ===
// Calculate enemy movement based on behavior type
export const calculateEnemyMovement = (enemy, deltaTime, canvasHeight) => {
  const { behavior, x, y, vx, vy, width, health, maxHealth } = enemy;
  let newVx = vx;
  let newVy = vy;
  let newX = x;
  let newY = y;
  let phaseTimer = enemy.phaseTimer;
  let isPhased = enemy.isPhased;

  switch (behavior) {
    case 'scurry': // Rat - erratic movement
      if (Math.random() < 0.05) {
        newVx = (Math.random() - 0.5) * 4;
        newVy = (Math.random() - 0.5) * 3;
      }
      break;

    case 'diagonal': // Kobold - diagonal bouncing
      // Just uses standard bounce, no special update
      break;

    case 'bounce': // Standard bouncing
      // Handled by wall collision in main loop
      break;

    case 'shamble': // Zombie - slow, relentless
      // Slower movement, handled by spawn speed
      break;

    case 'charge': // Orc - speeds up when damaged
      if (health < maxHealth && !enemy.enraged) {
        newVx *= 1.5;
        newVy *= 1.5;
        return { ...enemy, vx: newVx, vy: newVy, enraged: true };
      }
      break;

    case 'crawl': // Spider - wall crawling
      // Stays near top/walls
      if (newY > 200) {
        newVy = -Math.abs(newVy);
      }
      break;

    case 'swoop': // Harpy - diving attacks
      phaseTimer += deltaTime;
      if (phaseTimer > 2000) {
        // Dive toward bottom
        newVy = Math.abs(newVy) * 2;
        if (newY > canvasHeight - 150) {
          newVy = -Math.abs(newVy);
          phaseTimer = 0;
        }
      }
      break;

    case 'ambush': // Mimic - stationary until hit
      if (enemy.disguised) {
        newVx = 0;
        newVy = 0;
      }
      break;

    case 'rhythm': // Owlbear - pulsing movement
      phaseTimer += deltaTime;
      const pulse = Math.sin(phaseTimer / 500);
      newVx = vx * (1 + pulse * 0.3);
      newVy = vy * (1 + pulse * 0.3);
      break;

    case 'drift': // Gelatinous Cube - slow drift
      newVx *= 0.99;
      newVy *= 0.99;
      if (Math.abs(newVx) < 0.5) newVx = (Math.random() - 0.5) * 2;
      if (Math.abs(newVy) < 0.5) newVy = (Math.random() - 0.5) * 2;
      break;

    case 'frenzy': // Werewolf - fast when low health
      if (health <= maxHealth / 3 && !enemy.enraged) {
        newVx *= 2;
        newVy *= 2;
        return { ...enemy, vx: newVx, vy: newVy, enraged: true };
      }
      break;

    case 'slither': // Basilisk - snake movement
      phaseTimer += deltaTime;
      const wave = Math.sin(phaseTimer / 300) * 2;
      newX += wave;
      break;

    case 'hover': // Beholder - floats in place, then moves
      phaseTimer += deltaTime;
      isPhased = phaseTimer % 3000 < 1500;
      if (isPhased) {
        newVx = 0;
        newVy = 0;
      } else {
        // Move toward center slowly
        const centerX = CANVAS_WIDTH / 2;
        const centerY = 150;
        newVx = (centerX - x) * 0.001;
        newVy = (centerY - y) * 0.001;
      }
      break;

    case 'float': // Mind Flayer / Lich - hovering
      phaseTimer += deltaTime;
      newY += Math.sin(phaseTimer / 500) * 0.5;
      break;

    case 'glide': // Vampire - smooth diagonal movement
      // Elegant diagonal gliding
      break;

    case 'soar': // Dragon - majestic flight patterns
      phaseTimer += deltaTime;
      newX += Math.sin(phaseTimer / 800) * 3;
      newY += Math.cos(phaseTimer / 600) * 2;
      break;

    case 'rampage': // Tarrasque - unstoppable force
      // Moves steadily, doesn't bounce off walls as much
      if (newY > canvasHeight - 100) {
        newVy = -Math.abs(newVy) * 0.5;
      }
      break;
  }

  // Apply movement
  newX += newVx * (deltaTime / 16);
  newY += newVy * (deltaTime / 16);

  return {
    ...enemy,
    x: newX,
    y: newY,
    vx: newVx,
    vy: newVy,
    phaseTimer,
    isPhased,
  };
};

// Check if enemy should use special ability
export const shouldUseSpecial = (enemy, now) => {
  const cooldown = 2000; // 2 seconds between specials
  return enemy.special && (now - enemy.lastSpecialTime) > cooldown;
};

// Get projectile data for enemy special attacks
export const getEnemyProjectile = (enemy, targetY) => {
  const { special, x, y, width, height, themeColors } = enemy;
  const now = Date.now();

  switch (special) {
    case 'web': // Spider shoots webs
      return {
        id: uid(),
        type: 'web',
        x: x + width / 2,
        y: y + height,
        vy: 3,
        width: 20,
        height: 20,
        duration: 3000, // How long web effect lasts
        color: '#cccccc',
      };

    case 'shoot': // Beholder shoots eye rays
      return {
        id: uid(),
        type: 'eye_ray',
        x: x + width / 2,
        y: y + height / 2,
        targetY: targetY, // Target paddle Y
        vy: 5,
        width: 8,
        height: 30,
        color: '#ff0000',
      };

    case 'firebreath': // Dragon breathes fire
      return {
        id: uid(),
        type: 'fire',
        x: x + width / 2,
        y: y + height,
        vy: 4,
        vx: (Math.random() - 0.5) * 2,
        width: 15,
        height: 15,
        color: '#ff6600',
        lifetime: 2000,
        spawnTime: now,
      };

    case 'confuse': // Mind Flayer sends psychic wave
      return {
        id: uid(),
        type: 'psychic',
        x: x + width / 2,
        y: y + height,
        vy: 3,
        width: 40,
        height: 10,
        duration: 5000, // How long confusion lasts
        color: themeColors.primary || '#9966aa',
      };

    case 'petrify': // Basilisk petrifying gaze
      return {
        id: uid(),
        type: 'gaze',
        x: x + width / 2,
        y: y + height,
        vy: 4,
        width: 30,
        height: 30,
        duration: 2000, // How long petrify lasts
        color: '#888888',
      };

    default:
      return null;
  }
};
