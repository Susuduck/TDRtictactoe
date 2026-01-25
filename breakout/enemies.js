// breakout/enemies.js
// Enemy behavior logic (pure functions)

import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

/**
 * Update enemy position based on behavior type
 * Returns updated position/velocity values
 */
export const updateEnemyBehavior = (enemy, deltaTime, difficulty) => {
  let { x, y, vx, vy, phaseTimer = 0, enraged = false, disguised = false } = enemy;
  const behavior = enemy.behavior || 'bounce';
  const speedMult = enraged ? 1.8 : 1;
  const enemySpeed = difficulty?.enemySpeed || 1;

  switch (behavior) {
    case 'scurry': // Rat - fast unpredictable movement
      x += vx * 1.5 * speedMult;
      y += vy * 0.5;
      if (Math.random() < 0.02) {
        vx = (Math.random() - 0.5) * 3 * enemySpeed;
      }
      if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
      if (y < 60) vy = Math.abs(vy);
      break;

    case 'diagonal': // Kobold - moves in diagonal patterns
      x += vx * speedMult;
      y += vy * 0.6;
      if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
      if (y <= 60 || y >= CANVAS_HEIGHT / 2) vy = -vy;
      break;

    case 'bounce': // Standard bouncing (goblin, skeleton, troll)
      x += vx * speedMult;
      y += vy * 0.3;
      if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) {
        vx = -vx;
        x = Math.max(0, Math.min(CANVAS_WIDTH - enemy.width, x));
      }
      if (y < 60) vy = Math.abs(vy);
      break;

    case 'shamble': // Zombie - slow, lurching movement
      x += vx * 0.3 * speedMult;
      y += vy * 0.15;
      if (Math.random() < 0.01) {
        x += (Math.random() - 0.5) * 20;
      }
      if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
      if (y < 60) vy = Math.abs(vy);
      break;

    case 'charge': // Orc - speeds up when hit, aggressive
      const chargeSpeed = enraged ? 2.5 : 1.2;
      x += vx * chargeSpeed * speedMult;
      y += vy * 0.4;
      if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
      if (y <= 60 || y >= CANVAS_HEIGHT / 2) vy = -vy;
      break;

    case 'crawl': // Spider - crawls along edges
      x += vx * 0.8 * speedMult;
      y = 80 + Math.sin(Date.now() / 500) * 30;
      if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
      break;

    case 'swoop': // Harpy - dives down then back up
      x += vx * speedMult;
      phaseTimer += deltaTime;
      if (phaseTimer < 1500) {
        y += 2 * enemySpeed;
      } else if (phaseTimer < 3000) {
        y -= 1.5 * enemySpeed;
      } else {
        phaseTimer = 0;
      }
      if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
      y = Math.max(60, Math.min(CANVAS_HEIGHT * 0.6, y));
      break;

    case 'ambush': // Mimic - stays still when disguised
      if (!disguised) {
        x += vx * 1.5 * speedMult;
        y += vy * 0.8;
        if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
        if (y <= 60 || y >= CANVAS_HEIGHT / 2) vy = -vy;
      }
      break;

    case 'soar': // Owlbear/Dragon - smooth flying patterns
      x += vx * speedMult;
      y += Math.sin(Date.now() / 800) * 1.5;
      if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
      y = Math.max(60, Math.min(CANVAS_HEIGHT / 3, y));
      break;

    case 'roll': // Gelatinous Cube - slow but steady
      x += vx * 0.5 * speedMult;
      y += vy * 0.3;
      if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
      if (y <= 60 || y >= CANVAS_HEIGHT / 2) vy = -vy;
      break;

    case 'stalk': // Werewolf - tracks paddle position
      x += vx * speedMult;
      y += vy * 0.4;
      if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
      if (y <= 60 || y >= CANVAS_HEIGHT / 2) vy = -vy;
      break;

    case 'hover': // Beholder/Mindflayer - floats ominously
      x += Math.sin(Date.now() / 600) * 1.5;
      y += Math.cos(Date.now() / 800) * 1;
      x = Math.max(50, Math.min(CANVAS_WIDTH - 50 - enemy.width, x));
      y = Math.max(80, Math.min(CANVAS_HEIGHT / 3, y));
      break;

    case 'phase': // Vampire/Lich - phases in and out
      if (!enemy.isPhased) {
        x += vx * speedMult;
        y += vy * 0.5;
      }
      if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
      if (y <= 60 || y >= CANVAS_HEIGHT / 2) vy = -vy;
      break;

    case 'rampage': // Tarrasque - destroys everything in path
      x += vx * 2 * speedMult;
      y += vy * 0.6;
      if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
      if (y <= 80 || y >= CANVAS_HEIGHT / 2.5) vy = -vy;
      break;

    default:
      // Default bounce behavior
      x += vx * speedMult;
      y += vy * 0.3;
      if (x <= 0 || x >= CANVAS_WIDTH - enemy.width) vx = -vx;
      if (y < 60) vy = Math.abs(vy);
  }

  return { x, y, vx, vy, phaseTimer };
};
