# Breakout Game - File Structure Overview

## Current Architecture

The breakout game has been refactored from a single 11,000+ line file into modular components.

---

## Files

### `constants.js` (~77 lines)
Game configuration constants and sprite URLs.

**Contains:**
- Canvas dimensions (`CANVAS_WIDTH`, `CANVAS_HEIGHT`)
- Paddle settings (`PADDLE_WIDTH`, `PADDLE_HEIGHT`, `PADDLE_OFFSET_BOTTOM`)
- Ball settings (`BALL_RADIUS`)
- Brick grid layout (`BRICK_ROWS`, `BRICK_COLS`, `BRICK_WIDTH`, `BRICK_HEIGHT`, `BRICK_PADDING`, `BRICK_OFFSET_TOP`, `BRICK_OFFSET_LEFT`)
- Player mechanics (`DASH_SPEED`, `DASH_COOLDOWN`, `TEDDY_METER_MAX`, `KEYBOARD_SPEED`)
- Level progression (`MAX_LEVELS`, `STARS_TO_UNLOCK`, `POINTS_PER_STAR`)
- Invasion mode settings (`CHARGE_TIME_PER_LEVEL`, `SHIP_FIRE_COOLDOWN`, `INVASION_BALL_SPEED`, `ALIEN_SHOT_COOLDOWN`, `DIVE_SPAWN_COOLDOWN`)
- `SPRITES` object with image URLs for paddle, ball, and power-ups

---

### `data.js` (~2,332 lines)
Game data structures - enemies, levels, power-ups, weapons.

**Contains:**
- `ENEMY_SPRITES` - Pixel art frame data for 20 enemies (goblin, skeleton, troll, rat, kobold, zombie, orc, spider, harpy, mimic, owlbear, gelatinous cube, werewolf, beholder, vampire, mind flayer, dragon, lich, tarrasque, shadow smith)
- `ENEMY_THEME_COLORS` - Primary/secondary color themes per enemy
- `LEVEL_DEFINITIONS` - Hand-crafted level layouts for all 10 worlds (12 levels each = 120 levels total)
- `DEFAULT_LEVEL` - Fallback level pattern
- `WEAPONS` - Weapon definitions (bubble wand, gravity anchor, prism beam, vine launcher, echo pulse)
- `powerUpUnlocks` - Shop unlock data for power-ups
- `upgradeShop` - Permanent upgrade definitions
- `characterRares` - Rare character unlock costs
- `enemyDefs` - Enemy metadata (id, name, emoji, color, gimmick, behavior, quotes, etc.)
- `powerUpTypes` - Power-up definitions (expand, shrink, multi, fast, slow, life, laser, shield, magnet, mega, warp, weapons)

---

### `gameLogic.js` (~37 lines)
Pure game logic functions with no React dependencies.

**Contains:**
- `getDifficulty(enemyIndex, level)` - Calculates difficulty scaling (ball speed, brick health, paddle width, power-up chance, enemy count/speed/spawn rate) based on global level 1-100
- `calculateLevelStars(score, level)` - Returns 0-3 star rating based on score thresholds

---

### `enemies.js` (~145 lines)
Enemy behavior and movement logic.

**Contains:**
- `updateEnemyBehavior(enemy, deltaTime, difficulty)` - Pure function that calculates new position/velocity for an enemy based on behavior type

**Behavior Types:**
| Behavior | Enemy | Description |
|----------|-------|-------------|
| `scurry` | Rat | Fast, unpredictable horizontal movement |
| `diagonal` | Kobold | Diagonal movement patterns |
| `bounce` | Goblin, Skeleton, Troll | Standard bouncing |
| `shamble` | Zombie | Slow, lurching with random offsets |
| `charge` | Orc | Speeds up when enraged |
| `crawl` | Spider | Crawls along edges with sine wave |
| `swoop` | Harpy | Dives down then back up |
| `ambush` | Mimic | Stays still when disguised |
| `soar` | Owlbear, Dragon | Smooth flying with sine wave |
| `roll` | Gelatinous Cube | Slow but steady |
| `stalk` | Werewolf | Tracks toward paddle |
| `hover` | Beholder, Mind Flayer | Floats in figure-8 pattern |
| `phase` | Vampire, Lich | Phases in and out |
| `rampage` | Tarrasque | Fast, destructive movement |

---

### `BreakoutGame.jsx` (~8,900 lines)
Main React component with state, game loop, and rendering.

**State Management:**
- Game state (`gameState`, `isPaused`, `debugMode`)
- Player state (`paddle`, `balls`, `lives`, `score`, `combo`)
- Level state (`selectedEnemy`, `currentLevel`, `bricks`, `victoryInfo`)
- Power-ups (`powerUps`, `activeEffects`, `activeWeapon`, `weaponAmmo`)
- Enemy system (`enemies`, `enemyProjectiles`, `paddleDebuffs`)
- Pinball features (`bumpers`, `portals`, `spawners`)
- Visual effects (`particles`, `screenShake`, `flashColor`, `floatingTexts`)
- Teddy mechanics (`dashCooldown`, `teddyMeter`, `teddyAbilityActive`, `twinPaddle`)
- Invasion mode (`invasionMode`, `invasionBalls`, `ballsInShip`, `invasionFormation`, `alienProjectiles`, `divingAliens`)
- Level editor (`editorLevel`, `editorSelectedTool`, `customLevels`)
- Persistent stats (localStorage: high scores, stars, upgrades, unlocks)

**Key Functions:**
- `createBricks(level, enemy)` - Generates brick layout from level definitions
- `createParticles()`, `createPaddleBounceParticles()`, `createBrickShatterParticles()`, `createCrackingParticles()` - Visual effect generators
- `spawnEnemy()` - Creates enemy instance based on selected world
- `startGame()`, `startLevel()`, `selectEnemy()` - Game flow control
- `gameLoop()` - Main update loop (physics, collisions, AI)
- `purchaseUpgrade()`, `unlockPowerUp()` - Shop transactions

**Render Functions:**
- `renderGame()` - Main gameplay canvas (~2,560 lines)
- `renderMenu()` - Title screen with play/shop buttons
- `renderEnemySelect()` - World selection grid
- `renderLevelSelect()` - Level grid within a world
- `renderLevelPreview()` - Mini brick layout preview
- `renderLevelEditor()` - Custom level creation tool
- `renderGameOver()` - Death screen with stats
- `renderShop()` - Upgrade and unlock store

---

### `main.jsx` (~10 lines)
React entry point - mounts BreakoutGame to DOM.

### `index.html` (~15 lines)
HTML shell with root div and Vite script import.

---

## Brick Type Legend (Level Definitions)

| Char | Type | Description |
|------|------|-------------|
| `.` | Empty | No brick |
| `1` | Normal | 1-hit brick |
| `2` | Normal | 2-hit brick |
| `3` | Normal | 3-hit brick |
| `#` | Obstacle | Indestructible |
| `*` | Power-up | Random power-up drop |
| `X` | Explosive | Explodes on destroy |
| `F` | Frozen | Crack ice first, then destroy |
| `P` | Split | Breaks into 4 mini-bricks |
| `E` | Spawner | Spawns enemies when hit |
| `O` | Bumper | Pinball bumper (bounces ball) |
| `@` | Portal | Teleporter (paired with @1-@4) |
| `S` | Spawner Point | Enemy spawn location |
| `e` | Expand | Expand paddle power-up |
| `m` | Multi | Multi-ball power-up |
| `l` | Life | Extra life power-up |
| `z` | Laser | Laser power-up |
| `h` | Shield | Shield power-up |
| `g` | Magnet | Magnet power-up |
| `M` | Mega | Mega ball power-up |
| `s` | Slow | Slow ball power-up |
| `B` | Bubble Wand | Weapon brick |
| `A` | Gravity Anchor | Weapon brick |
| `R` | Prism Beam | Weapon brick |
| `V` | Vine Launcher | Weapon brick |
| `W` | Echo Pulse | Weapon brick |

---

## Build & Run

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Build for production
npm run preview  # Preview production build
```
