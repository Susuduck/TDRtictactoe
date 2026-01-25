// breakout/gameLogic.js
// Pure game logic functions (no React dependencies)

/**
 * Calculate difficulty scaling based on world and level
 * Global level = enemyIndex * 10 + levelNumber (1-100)
 */
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

/**
 * Calculate star rating for a level based on score
 * Returns 0-3 stars
 */
export const calculateLevelStars = (score, level) => {
  const baseThresholds = [150, 350, 600]; // Base thresholds for level 1
  const multiplier = 1 + (level - 1) * 0.3; // 30% harder per level
  const thresholds = baseThresholds.map(t => Math.floor(t * multiplier));
  if (score >= thresholds[2]) return 3;
  if (score >= thresholds[1]) return 2;
  if (score >= thresholds[0]) return 1;
  return 0;
};
