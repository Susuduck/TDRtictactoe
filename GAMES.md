# TDR Game Collection

A collection of browser-based games built with React.

## Quick Start

### Windows
Double-click `play.bat` to start the game server and choose which game to play.

### Manual Start
1. Open a terminal in this folder
2. Run: `python -m http.server 8000`
3. Open http://localhost:8000/menu.html in your browser

### Tower Defense Only
The Tower Defense game (`tower-defense.html`) can be opened directly in your browser without a server.

---

## Games

### Ultimate Tic Tac Toe

A strategic twist on classic tic-tac-toe where you play on a 3x3 grid of 3x3 boards.

**How to Play:**
- Win small boards by getting 3 in a row
- The cell you play in determines which board your opponent must play in next
- Win 3 small boards in a row on the big board to win the game

**Features:**
- **10 Unique Opponents** - Each with their own personality and difficulty level
- **AI Learning System** - The AI remembers your patterns and adapts to your playstyle
- **Star Progression** - Earn stars by winning to unlock harder opponents
- **Game Twists** - Random modifiers that change gameplay:
  - **Speed Round** (10%) - Limited time per turn
  - **Fog of War** (7%) - Can only see nearby boards
  - **Sudden Death** (6%) - First to win any board wins
  - **Chaos Shuffle** (6%) - Boards swap positions periodically
  - **Hot Potato** (5%) - Avoid the moving bomb
  - **Shrinking Board** (5%) - Cells get blocked over time
  - **Double Down** (3%) - Place two pieces per turn
  - **Blackout** (3%) - Screen goes dark periodically
  - **Gomoku Mode** (2%) - 15x15 board, get 5 in a row to win

**Character Gimmicks:**
Each opponent has a unique mini-game that triggers during battle:

| Character | Gimmick | Description |
|-----------|---------|-------------|
| Funky Frog | Fly Swat | Click all the flies before time runs out |
| Cheeky Chicken | Egg Splat | Random cells get covered with eggs |
| Disco Dinosaur | Dance Sequence | Memorize and repeat a pattern |
| Radical Raccoon | Trash Cleanup | Drag trash items to the bin |
| Electric Eel | Shock Zones | Avoid electrified cells |
| Mysterious Moth | Lights Out | Only see where your cursor is |
| Professor Penguin | Pop Quiz | Answer math questions correctly |
| Sly Snake | Piece Swap | Protect your pieces from being swapped |
| Wolf Warrior | Wolf Rush | Click wolves before they reach the center |
| Grand Master Grizzly | Chaos Master | Random gimmick from all previous enemies |

---

### Tower Defense

A feature-rich mazing tower defense game with particle effects, upgrades, and combo system.

**How to Play:**
1. Click a tower type in the left panel to select it
2. Click on the grid to place (range indicator shows on hover)
3. Click a placed tower to view stats and upgrade it
4. Right-click a tower to sell it (60% return)
5. Press "Start Wave" to begin - use the speed button (1x/2x/3x) to control pace
6. Build mazes to make enemies walk longer paths!

**Tower Types (with 3 upgrade tiers each):**

| Tower | Cost | Damage | Special | Upgrades To |
|-------|------|--------|---------|-------------|
| Arrow | 30g | 12 | 15% crit chance (2x damage) | Marksman (35% crit, fast) |
| Cannon | 60g | 45 | Splash damage (1.2 radius) | Devastator (2.0 splash) |
| Sniper | 80g | 75 | Long range (6 tiles) | Railgun (250 dmg, 8 range) |
| Frost | 50g | 8 | Slows 40% for 2.5s | Absolute Zero (70% slow) |
| Tesla | 100g | 20 | Chain lightning (4 targets) | Storm Caller (8 chains) |
| Plague | 70g | 5 | Poison DoT + splash poison | Blight (35 poison/sec) |
| Laser | 120g | 3/tick | Continuous beam | Death Ray (12 dmg/tick) |

**Enemy Types:**

| Enemy | Health | Speed | Special |
|-------|--------|-------|---------|
| Slime | 40 | 0.9 | Basic enemy |
| Scout | 25 | 1.8 | Fast but fragile |
| Golem | 180 | 0.45 | Slow and tanky |
| Bug | 15 | 1.4 | Weak swarm unit |
| Medic | 60 | 0.7 | Heals nearby enemies |
| Knight | 100 | 0.6 | Has 50 shield (absorbs damage first) |
| Amoeba | 80 | 0.8 | Splits into 2 bugs on death |
| Dragon | 800 | 0.35 | Boss every 5 waves |
| Titan | 2000 | 0.25 | Mega boss every 10 waves |

**Game Features:**
- **60 FPS** smooth animations with particle effects
- **Combo System** - Kill enemies quickly for bonus gold (up to 50x combo)
- **Critical Hits** - Arrow towers can crit for double damage
- **Upgrade System** - 3 tiers per tower, click to upgrade
- **Tower Stats** - Track damage dealt and kills per tower
- **Visual Effects** - Projectile trails, explosions, floating damage numbers, screen shake
- **Status Effects** - Slow (snowflake icon) and Poison (skull icon) visible on enemies

**Strategy Tips:**
- Create long mazes early - path length is key
- Frost + high-damage towers = deadly combo
- Tesla towers melt grouped enemies
- Plague towers are great for damage-over-time on tanky enemies
- Laser towers ramp up damage the longer they fire
- Upgrade existing towers before building new ones
- Watch for Medics - they heal other enemies!

---

## Menu System

The `menu.html` page provides a visual interface to launch either game.

**Files:**
- `menu.html` - Main game selection menu
- `ultimate-tictactoe.html` - Ultimate Tic Tac Toe game
- `ultimate-tictactoe-v3.jsx` - Game source code
- `tower-defense.html` - Tower Defense game (standalone)
- `play.bat` - Windows launcher with server

---

## Technical Notes

- Built with React 18 and Babel standalone for in-browser JSX compilation
- Tower Defense is fully self-contained and works without a server
- Ultimate Tic Tac Toe requires a local server due to file loading restrictions
- Game progress is saved to localStorage
