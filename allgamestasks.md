# All Games Task List

## Overview

This document tracks the implementation of 14 mini-games from Teddy's Mini-Game Compendium.

**Total Games to Create:** 14
**Structure:** Each game has 10 worlds with 10 levels each (100 levels total per game)
**Progression:** Sequential unlock - must complete previous world to unlock next

---

## Games to Implement

### Action Games (9)

| # | Game | Folder | Status | Description |
|---|------|--------|--------|-------------|
| 1 | Arm Wrestling | `/arm-wrestling/` | Not Started | Rapid tap battle |
| 2 | Basketball Toss | `/basketball/` | Not Started | Timing-based arc throw |
| 3 | Shooting Gallery | `/shooting-gallery/` | Not Started | Tap targets as they pop up |
| 4 | Submarine | `/submarine/` | Not Started | Side-scrolling tunnel navigation |
| 5 | Flappy Bird | `/flappy-teddy/` | Not Started | Tap to flap through gaps |
| 6 | Jump Rope | `/jump-rope/` | Not Started | Rhythm tap jumping |
| 7 | Batting Cage | `/batting-cage/` | Not Started | Timing-based swing |
| 8 | Honey Pot Drop | `/honey-catch/` | Not Started | Catch falling items |
| 9 | Beach Ball | `/beach-ball/` | Not Started | Keep ball airborne |

### Strategy/Puzzle Games (5)

| # | Game | Folder | Status | Description |
|---|------|--------|--------|-------------|
| 10 | Treasure Dig | `/treasure-dig/` | Not Started | Hot/cold treasure hunting |
| 11 | Fishing | `/fishing/` | Not Started | Cast timing + reel rhythm |
| 12 | Honey Grid | `/honey-grid/` | Not Started | Voltorb Flip style deduction |
| 13 | Cook-Off | `/cook-off/` | Not Started | Order matching |
| 14 | Chinchirorin | `/chinchirorin/` | Not Started | Dice gambling |

---

## Standard Structure Per Game

Each game folder contains:
```
/game-name/
├── game-name.html          # Entry point
├── game-name.jsx           # React game code
└── README.md               # Game documentation
```

---

## World/Level Structure

Each game has 10 "Opponents" (worlds) with 10 levels each:

### World 1-10 Opponent Theme Pattern
| World | Opponent | Difficulty | Character Theme |
|-------|----------|------------|-----------------|
| 1 | Funky Frog | Easy | Beginner, encouraging |
| 2 | Cheeky Chicken | Easy+ | Slightly tricky |
| 3 | Disco Dinosaur | Medium- | Dance themed |
| 4 | Radical Raccoon | Medium | Sneaky tricks |
| 5 | Electric Eel | Medium+ | Shocking surprises |
| 6 | Mysterious Moth | Hard- | Darkness/confusion |
| 7 | Professor Penguin | Hard | Smart strategies |
| 8 | Sly Snake | Hard+ | Deceptive moves |
| 9 | Wolf Warrior | Expert | Aggressive |
| 10 | Grand Master Grizzly | Master | Ultimate challenge |

### Progression System
- 40 points needed per opponent to unlock next
- Win = 2 points, Draw/Partial = 1 point
- 4 points = 1 star (visual display)
- 10 stars per opponent = 40 points = Mastered

### Difficulty Scaling Per Level (within each opponent)
| Level | Difficulty Multiplier | Description |
|-------|----------------------|-------------|
| 1 | 1.0x | Introduction |
| 2-3 | 1.1x | Learning |
| 4-5 | 1.2x | Practice |
| 6-7 | 1.4x | Challenge |
| 8-9 | 1.6x | Advanced |
| 10 | 2.0x | Master level |

---

## Detailed Game Tasks

### 1. Arm Wrestling (`/arm-wrestling/`)

**Mechanic:** Rapid tap battle - fill power bar before opponent

**Files:**
- [ ] `arm-wrestling.html` - Entry point
- [ ] `arm-wrestling.jsx` - Game logic
- [ ] `README.md` - Documentation

**Implementation:**
- [ ] Two progress bars (player vs opponent)
- [ ] Tap counter with speed detection
- [ ] AI tap timer (scales with difficulty)
- [ ] Stamina system (tap too fast = tire out)
- [ ] 10 opponent characters with unique animations
- [ ] Visual feedback (arm movement, strain effects)
- [ ] Sound effects (tap, strain, win/lose)

**Difficulty Scaling:**
- World 1: AI taps at ~2 taps/sec, needs ~30 taps
- World 10: AI taps at ~8 taps/sec, needs ~100 taps, stamina drain active

---

### 2. Basketball Toss (`/basketball/`)

**Mechanic:** Timing-based arc throw

**Files:**
- [ ] `basketball.html` - Entry point
- [ ] `basketball.jsx` - Game logic
- [ ] `README.md` - Documentation

**Implementation:**
- [ ] Moving power meter (oscillating left-right)
- [ ] Tap to set power
- [ ] Ball arc trajectory (parabola physics)
- [ ] Basket hit detection
- [ ] 10 shots per session
- [ ] Score: Miss=0, Rim=1, Clean=2, Swish=3

**Difficulty Scaling:**
- World 1: Large basket, slow meter, no wind
- World 10: Small basket, fast meter, strong wind, moving basket

---

### 3. Shooting Gallery (`/shooting-gallery/`)

**Mechanic:** Tap targets as they pop up

**Files:**
- [ ] `shooting-gallery.html` - Entry point
- [ ] `shooting-gallery.jsx` - Game logic
- [ ] `README.md` - Documentation

**Implementation:**
- [ ] 60 second rounds
- [ ] Target spawn system (holes/objects)
- [ ] Different target types (10-100 points)
- [ ] Friendly targets (-50 if hit)
- [ ] Combo multiplier system
- [ ] Boss bugs (multi-tap)

**Difficulty Scaling:**
- World 1: Slow spawns, 2s windows, no friendlies
- World 10: Fast spawns, 0.3s windows, many friendlies, boss bugs

---

### 4. Submarine (`/submarine/`)

**Mechanic:** Side-scrolling tunnel navigation

**Files:**
- [ ] `submarine.html` - Entry point
- [ ] `submarine.jsx` - Game logic
- [ ] `README.md` - Documentation

**Implementation:**
- [ ] Auto-scrolling right movement
- [ ] Tap/hold to move up, release to fall
- [ ] Procedural tunnel generation
- [ ] Collectibles (honey drops)
- [ ] Obstacles (rocks, narrow passages)
- [ ] Power-ups (shield, speed boost)

**Difficulty Scaling:**
- World 1: Wide tunnels, slow speed, many shields
- World 10: Narrow tunnels, fast speed, no shields, moving obstacles

---

### 5. Flappy Teddy (`/flappy-teddy/`)

**Mechanic:** Tap to flap through gaps

**Files:**
- [ ] `flappy-teddy.html` - Entry point
- [ ] `flappy-teddy.jsx` - Game logic
- [ ] `README.md` - Documentation

**Implementation:**
- [ ] Gravity constant
- [ ] Tap impulse (flap)
- [ ] Pipe spawning with gaps
- [ ] Collision detection
- [ ] Score = pipes passed
- [ ] Golden gaps worth bonus

**Difficulty Scaling:**
- World 1: Large gaps, slow pipes, low gravity
- World 10: Small gaps, fast pipes, moving pipes, high gravity

---

### 6. Jump Rope (`/jump-rope/`)

**Mechanic:** Rhythm tap - jump over rope

**Files:**
- [ ] `jump-rope.html` - Entry point
- [ ] `jump-rope.jsx` - Game logic
- [ ] `README.md` - Documentation

**Implementation:**
- [ ] Rope swing animation (rhythm-based)
- [ ] Tap timing window
- [ ] Speed progression (60-180 BPM)
- [ ] Miss = game over
- [ ] Score = jumps completed

**Difficulty Scaling:**
- World 1: 60 BPM, large timing window
- World 10: 180+ BPM, tiny timing window, double dutch variant

---

### 7. Batting Cage (`/batting-cage/`)

**Mechanic:** Timing-based swing

**Files:**
- [ ] `batting-cage.html` - Entry point
- [ ] `batting-cage.jsx` - Game logic
- [ ] `README.md` - Documentation

**Implementation:**
- [ ] Pitch types (slow, fast, curve)
- [ ] Swing timing window
- [ ] Hit quality (whiff, foul, single, double, home run)
- [ ] 10 pitches per session
- [ ] Score based on hits

**Difficulty Scaling:**
- World 1: Slow balls, large timing windows
- World 10: Boss Specials, tiny timing windows, all pitch types

---

### 8. Honey Pot Drop (`/honey-catch/`)

**Mechanic:** Catch falling items

**Files:**
- [ ] `honey-catch.html` - Entry point
- [ ] `honey-catch.jsx` - Game logic
- [ ] `README.md` - Documentation

**Implementation:**
- [ ] Player horizontal movement (swipe/keys)
- [ ] Falling item spawning
- [ ] Good items (+points) vs bad items (-points/stun)
- [ ] 60 second rounds
- [ ] Game over item (termination letter)

**Difficulty Scaling:**
- World 1: Slow falling, mostly good items
- World 10: Fast falling, many bad items, more game-over items

---

### 9. Beach Ball (`/beach-ball/`)

**Mechanic:** Tap ball to keep airborne

**Files:**
- [ ] `beach-ball.html` - Entry point
- [ ] `beach-ball.jsx` - Game logic
- [ ] `README.md` - Documentation

**Implementation:**
- [ ] Ball physics (gravity + impulse)
- [ ] Tap detection on ball
- [ ] Ball speed increase over time
- [ ] Smaller tap target over time
- [ ] Power-ups (slow-mo, big ball)

**Difficulty Scaling:**
- World 1: Big ball, low gravity, slow speed increase
- World 10: Small ball, high gravity, fast speed increase, wind

---

### 10. Treasure Dig (`/treasure-dig/`)

**Mechanic:** Hot/cold treasure hunting on grid

**Files:**
- [ ] `treasure-dig.html` - Entry point
- [ ] `treasure-dig.jsx` - Game logic
- [ ] `README.md` - Documentation

**Implementation:**
- [ ] Grid map (7x7 to 15x15)
- [ ] Hidden treasure placement
- [ ] Dig mechanic with hot/cold feedback
- [ ] Dig limit per game
- [ ] Multiple treasures in later levels

**Difficulty Scaling:**
- World 1: 7x7 grid, 15 digs, 1 treasure
- World 10: 15x15 grid, 8 digs, 3 treasures, decoy items

---

### 11. Fishing (`/fishing/`)

**Mechanic:** Cast timing + reel rhythm

**Files:**
- [ ] `fishing.html` - Entry point
- [ ] `fishing.jsx` - Game logic
- [ ] `README.md` - Documentation

**Implementation:**
- [ ] Cast power meter
- [ ] Wait for bite (random timer)
- [ ] Hook timing (tap when "!" appears)
- [ ] Reel rhythm mechanic (tap to drain stamina)
- [ ] Line tension system (break = lose fish)
- [ ] Fish types with different rewards

**Difficulty Scaling:**
- World 1: Easy fish, large hook windows, forgiving tension
- World 10: Legendary fish, tiny hook windows, sensitive tension

---

### 12. Honey Grid (`/honey-grid/`)

**Mechanic:** Voltorb Flip style deduction

**Files:**
- [ ] `honey-grid.html` - Entry point
- [ ] `honey-grid.jsx` - Game logic
- [ ] `README.md` - Documentation

**Implementation:**
- [ ] 5x5 grid of hidden tiles
- [ ] Tile types: x1, x2, x3, TRAP
- [ ] Row/column hints (sum + trap count)
- [ ] Score multiplier system
- [ ] Grid generation with valid hints

**Difficulty Scaling:**
- World 1: Few traps, high value hints, small multipliers
- World 10: Many traps, ambiguous hints, huge multipliers needed

---

### 13. Cook-Off (`/cook-off/`)

**Mechanic:** Fast-paced order matching

**Files:**
- [ ] `cook-off.html` - Entry point
- [ ] `cook-off.jsx` - Game logic
- [ ] `README.md` - Documentation

**Implementation:**
- [ ] Order display (recipe + ingredients)
- [ ] Ingredient conveyor/grid
- [ ] Tap ingredients in correct order
- [ ] Timer per order
- [ ] 3 wrong orders = game over
- [ ] Speed increases over time

**Difficulty Scaling:**
- World 1: Simple 2-ingredient recipes, 15s per order
- World 10: Complex 5-ingredient recipes, 6s per order, distractions

---

### 14. Chinchirorin (`/chinchirorin/`)

**Mechanic:** Dice gambling vs dealer

**Files:**
- [ ] `chinchirorin.html` - Entry point
- [ ] `chinchirorin.jsx` - Game logic
- [ ] `README.md` - Documentation

**Implementation:**
- [ ] 3 dice roll animation
- [ ] Combination detection (arashi, triples, sequences, points)
- [ ] Dealer AI (The Boss)
- [ ] Bet system with stakes
- [ ] Payout calculation

**Difficulty Scaling:**
- World 1: Fair dice, low stakes
- World 10: Boss "cheats" occasionally, high stakes, harder combos to beat

---

## Menu & Navigation Updates

### menu.html Updates
- [ ] Add card for each new game
- [ ] Maintain consistent styling
- [ ] Use appropriate colors and emojis

### play.bat Updates
- [ ] Add launch option for each game
- [ ] Maintain numbered menu

---

## Testing Checklist

For each game:
- [ ] Game loads without errors
- [ ] All 10 opponents are accessible
- [ ] Progression saves to localStorage
- [ ] Difficulty scales properly 1-10
- [ ] Stars/points display correctly
- [ ] Sequential unlock works
- [ ] Back to menu works
- [ ] Responsive on different screen sizes

---

## Color Palette Reference

| Game | Primary Color | Emoji |
|------|--------------|-------|
| Arm Wrestling | #e85a50 (red) | 💪 |
| Basketball | #f4a460 (sandy) | 🏀 |
| Shooting Gallery | #50c878 (green) | 🎯 |
| Submarine | #4169e1 (royal blue) | 🚇 |
| Flappy Teddy | #87ceeb (sky blue) | 🐻 |
| Jump Rope | #ff69b4 (hot pink) | 🪢 |
| Batting Cage | #228b22 (forest green) | ⚾ |
| Honey Catch | #ffd700 (gold) | 🍯 |
| Beach Ball | #ff6347 (tomato) | 🏐 |
| Treasure Dig | #daa520 (goldenrod) | 🗺️ |
| Fishing | #1e90ff (dodger blue) | 🎣 |
| Honey Grid | #9932cc (dark orchid) | 🧩 |
| Cook-Off | #ff4500 (orange red) | 👨‍🍳 |
| Chinchirorin | #8b0000 (dark red) | 🎲 |

---

## Estimated Complexity

| Complexity | Games |
|------------|-------|
| Easy | Arm Wrestling, Jump Rope, Batting Cage, Beach Ball, Chinchirorin |
| Easy-Medium | Basketball, Flappy Teddy, Honey Catch, Treasure Dig, Cook-Off |
| Medium | Shooting Gallery, Submarine, Fishing, Honey Grid |

---

## Progress Tracker

| Phase | Status | Games |
|-------|--------|-------|
| Phase 1 | Not Started | Easy games (5) |
| Phase 2 | Not Started | Easy-Medium games (5) |
| Phase 3 | Not Started | Medium games (4) |
| Integration | Not Started | Menu + play.bat |
| Testing | Not Started | All games |

---

*Last Updated: Auto-generated*
