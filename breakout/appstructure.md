# Breakout Game - App Structure

## File Overview

```
breakout/
├── constants.js       # Game settings and configuration
├── data.js            # Static game data (sprites, levels, etc.)
├── gameLogic.js       # Core mechanics - pure functions
├── enemies.js         # Enemy system - pure functions
├── BreakoutGame.jsx   # Main React component
├── main.jsx           # Entry point
└── index.html         # HTML shell
```

## Module Breakdown

### constants.js
Game configuration values. Change these to tweak gameplay feel.

- Canvas dimensions (900x650)
- Paddle/ball/brick sizes
- Movement speeds (dash, keyboard)
- Timing values (cooldowns, charge times)
- `SPRITES` - URLs for game images

### data.js
Static game content. Edit this to add/modify game content.

- `ENEMY_SPRITES` - Pixel art for 20 D&D-inspired enemies (rat, goblin, dragon, etc.)
- `ENEMY_THEME_COLORS` - Color palettes per world
- `LEVEL_DEFINITIONS` - Hand-crafted brick layouts for 10 worlds x 12 levels
- `WEAPONS` - Weapon definitions (bubble wand, gravity anchor, etc.)
- `powerUpTypes` - All power-up effects
- `powerUpUnlocks`, `upgradeShop` - Progression/shop data
- `enemyDefs` - Enemy boss metadata (names, gimmicks, quotes)
- `characterRares` - Rare power-ups per character

### gameLogic.js
Pure utility functions for core mechanics. No React dependencies.

- `uid()` - Unique ID generator
- `getDifficulty(enemyIndex, level)` - Scales difficulty 1-100
- `healthTiers` - Brick color/health mapping
- `getColorForHealth(health)` - Returns brick color
- `PORTAL_COLORS` - Portal pair color schemes
- `createBricksData(level, enemy)` - Generates brick/bumper/portal/spawner layout
- `createBallData(level, enemyIndex, paddleX, paddleWidth)` - Creates ball object

### enemies.js
Pure functions for the enemy system. No React dependencies.

- `TIER_ENEMIES` - Enemy pools by difficulty tier (1-5)
- `getMaxTier(globalLevel)` - Determines available enemy tiers
- `rollEnemyTier(maxTier)` - Random tier selection with rarity weighting
- `createEnemyData(difficulty, selectedEnemyId)` - Spawns enemy with position/behavior
- `calculateEnemyMovement(enemy, deltaTime, canvasHeight)` - Movement patterns per behavior type
- `shouldUseSpecial(enemy, now)` - Checks special ability cooldown
- `getEnemyProjectile(enemy, targetY)` - Creates projectile data for enemy attacks

### BreakoutGame.jsx
The main React component. Handles all state and rendering.

**State management:**
- Game state (menu, playing, paused, game over)
- Paddle, balls, bricks, enemies
- Power-ups, effects, particles
- Invasion mode, level editor
- Player stats and progression

**Key sections:**
- ~200 lines: State declarations
- ~2500 lines: Game loop, physics, collision detection
- ~4500 lines: Render functions (game, menu, shop, level editor, etc.)

## Dependency Graph

```
constants.js ────────────────────────────┐
      │                                  │
      v                                  │
   data.js ──────────────────────────────┤
      │                                  │
      ├──────────────┬───────────────────┤
      v              v                   v
 gameLogic.js    enemies.js      BreakoutGame.jsx
      │              │                   │
      └──────────────┴───────────────────┘
                     │
                     v
                 main.jsx
```

- `constants.js` has no dependencies
- `data.js` has no dependencies
- `gameLogic.js` imports from constants + data
- `enemies.js` imports from constants + data + gameLogic (for `uid`)
- `BreakoutGame.jsx` imports from all of the above

## Where to Find Things

| Want to change... | Look in... |
|-------------------|------------|
| Game dimensions, speeds | `constants.js` |
| Sprite images | `constants.js` → `SPRITES` |
| Level layouts | `data.js` → `LEVEL_DEFINITIONS` |
| Enemy pixel art | `data.js` → `ENEMY_SPRITES` |
| Power-up effects | `data.js` → `powerUpTypes` |
| Difficulty scaling | `gameLogic.js` → `getDifficulty` |
| Brick generation | `gameLogic.js` → `createBricksData` |
| Enemy spawning | `enemies.js` → `createEnemyData` |
| Enemy AI/movement | `enemies.js` → `calculateEnemyMovement` |
| React state | `BreakoutGame.jsx` (top of component) |
| Game loop/physics | `BreakoutGame.jsx` (useEffect) |
| UI rendering | `BreakoutGame.jsx` (render functions) |

## Running the Game

```bash
npm install
npm run dev
```

Opens at http://localhost:3000
