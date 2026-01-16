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

A classic mazing tower defense game where you build towers to stop waves of enemies.

**How to Play:**
1. Click a tower type in the shop to select it
2. Click on the grid to place the tower (green = valid, red = blocks path)
3. Press "Start Wave" to begin enemy spawns
4. Survive all waves!

**Important:** You can build mazes to make enemies take longer paths, but you cannot completely block the path from start to end.

**Tower Types:**

| Tower | Cost | Damage | Range | Special |
|-------|------|--------|-------|---------|
| Arrow | 25g | 10 | 3 | Fast attack speed |
| Cannon | 50g | 25 | 2.5 | Splash damage |
| Sniper | 75g | 50 | 5 | Long range |
| Frost | 40g | 5 | 2.5 | Slows enemies by 50% |
| Lightning | 100g | 30 | 3.5 | Chains to 3 nearby enemies |

**Enemy Types:**

| Enemy | Health | Speed | Reward | Special |
|-------|--------|-------|--------|---------|
| Slime | 50 | 0.8 | 10g | Basic enemy |
| Scout | 30 | 1.5 | 15g | Fast but fragile |
| Golem | 150 | 0.4 | 25g | Slow but tanky |
| Bug | 40 | 1.2 | 12g | Slightly fast |
| Dragon | 500+ | 0.6 | 100g | Boss (waves 5, 10, 15...) |

**Tips:**
- Build mazes early to maximize tower damage
- Frost towers are great for slowing enemies into kill zones
- Save gold for lightning towers against grouped enemies
- Dragons get stronger each time they appear

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
