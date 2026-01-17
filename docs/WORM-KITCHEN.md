# Worm Kitchen - Complete Game Design Document

A split-attention arcade game combining worm/snake gameplay with order fulfillment mechanics. Players control a worm collecting fruits on the left side while managing recipe orders on the right side.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concept](#core-concept)
3. [Game Design Principles](#game-design-principles)
4. [Dual-Window Layout](#dual-window-layout)
5. [Left Side: Worm Game](#left-side-worm-game)
6. [Right Side: Kitchen Orders](#right-side-kitchen-orders)
7. [The Focus Switch Mechanic](#the-focus-switch-mechanic)
8. [Controls](#controls)
9. [Recipes & Ingredients](#recipes--ingredients)
10. [UI/UX Specifications](#uiux-specifications)
11. [Visual Design](#visual-design)
12. [Audio Design](#audio-design)
13. [Difficulty Progression](#difficulty-progression)
14. [Scoring System](#scoring-system)
15. [Game States](#game-states)
16. [Technical Specifications](#technical-specifications)
17. [Accessibility](#accessibility)

---

## Overview

**Game Name:** Worm Kitchen
**Tagline:** "Feed the worm. Fulfill the orders. Don't let either die."
**Genre:** Split-attention arcade / Multitasking puzzle
**Platform:** Browser (React + Canvas)
**Based On:** RPG Snake (snake.jsx) - reuses worm movement and rendering logic

**Unique Selling Point:** The only game where your snake game and cooking game are happening simultaneously, creating a unique plate-spinning tension.

---

## Core Concept

### The Basic Loop

```
1. WORM SIDE: Control worm, eat fruits
2. Fruits appear as ingredients in the KITCHEN SIDE tray
3. KITCHEN SIDE: Orders appear requesting specific fruit combinations
4. Switch focus (Space) to kitchen, combine ingredients, fulfill orders
5. While in kitchen: Worm enters SLOW-MO but KEEPS MOVING
6. Switch back before worm hits wall/self
7. Repeat with increasing pressure
```

### The Tension

The game creates tension through:
- **Peripheral vision anxiety**: Seeing the slow-mo worm drift toward danger while you're fulfilling orders
- **Competing priorities**: Urgent order expiring vs. worm in danger
- **Strategic collection**: Choosing which fruits to eat based on pending orders
- **Risk/reward switching**: Stay longer for combo bonuses vs. save the worm

---

## Game Design Principles

This game is designed using established game design theory:

### Pattern Learning (Raph Koster's Theory of Fun)
- Recipes are patterns players learn through repetition
- Visual logic reinforces learning (color families, ingredient types)
- Deep enough to keep learning, shallow enough for split-second decisions

### Flow State (Csikszentmihalyi)
- Difficulty scales with player skill
- Early game is forgiving, late game is demanding
- Player always has something to do (no waiting states)

### 4 Keys to Fun (Nicole Lazzaro)
- **Hard Fun**: Clear goals (orders), obstacles (timers, worm danger), triumph (close calls)
- **Easy Fun**: Novelty of dual-attention gameplay, recipe discovery
- **People Fun**: Score competition, shareable moments
- **Serious Fun**: Skill mastery, efficiency optimization

### Self-Determination Theory (Deci & Ryan)
- **Autonomy**: Player chooses when to switch, what to collect, which orders to prioritize
- **Competence**: Skill expression through keyboard mastery and time management
- **Relatedness**: Leaderboards, shared scores

### Avoiding Anti-Fun
- No luck-based mechanics (player controls all outcomes)
- Mistakes aren't punished harshly (wrong ingredient just bounces back)
- Failures are clear and feel fair (timers visible, danger audio)
- No grinding (every round is fresh pressure)

---

## Dual-Window Layout

### Screen Division

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           WORM KITCHEN                                  │
├───────────────────────────────┬─────────────────────────────────────────┤
│                               │                                         │
│      WORM SIDE (50%)          │         KITCHEN SIDE (50%)              │
│                               │                                         │
│   ┌───────────────────────┐   │   ┌─────────────────────────────────┐   │
│   │                       │   │   │         ORDER QUEUE             │   │
│   │     20x20 Grid        │   │   │   [Order] [Order] [Order]       │   │
│   │                       │   │   ├─────────────────────────────────┤   │
│   │   🐛~~~~              │   │   │                                 │   │
│   │              🍎       │   │   │       ACTIVE ORDER              │   │
│   │        🍌             │   │   │    [ 🍎 ] + [ __ ] = 🥤         │   │
│   │                       │   │   │                                 │   │
│   │   Score: 1250         │   │   ├─────────────────────────────────┤   │
│   │   URGENT: 🍊🍋        │   │   │      INGREDIENT TRAY            │   │
│   └───────────────────────┘   │   │   [🍎][🍌][🍊][ ][ ][ ]         │   │
│                               │   └─────────────────────────────────┘   │
│                               │                                         │
├───────────────────────────────┴─────────────────────────────────────────┤
│  [Space] Switch Focus  │  [1-6] Add Ingredient  │  [Arrows] Move Worm   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Focus States

**WORM FOCUS (Default)**
- Worm side: Full brightness, full speed
- Kitchen side: Slightly dimmed (opacity: 0.8), orders still tick down
- Controls: Arrow keys / WASD move worm

**KITCHEN FOCUS (After Space)**
- Worm side: Desaturated, slow-mo (25% speed), vignette effect
- Kitchen side: Full brightness, active
- Controls: Number keys add ingredients

---

## Left Side: Worm Game

### Grid Specifications
- **Grid Size**: 20x20 cells
- **Cell Size**: 20px (400x400 total)
- **Worm Speed (Normal)**: 150ms per move
- **Worm Speed (Slow-mo)**: 600ms per move (25% speed)

### Worm Behavior
- Classic snake movement (grows when eating)
- Wraps around edges (no wall death)
- Dies on self-collision only
- Visual: Cute worm with eyes, segmented body

### Fruits (Ingredients)
Each fruit the worm eats appears in the Kitchen's ingredient tray.

| Fruit | Emoji | Color | Spawn Rate |
|-------|-------|-------|------------|
| Apple | 🍎 | Red | 20% |
| Banana | 🍌 | Yellow | 20% |
| Orange | 🍊 | Orange | 15% |
| Grape | 🍇 | Purple | 15% |
| Strawberry | 🍓 | Pink | 15% |
| Lemon | 🍋 | Yellow | 10% |
| Mango | 🥭 | Orange | 5% |

### Worm Side HUD
- **Score**: Top-left, large
- **Worm Length**: Top-right
- **Urgent Needs**: Bottom bar showing ingredients needed for expiring orders
- **Danger Indicator**: Flashes when worm near self-collision

### Fruit Highlighting
Fruits that match urgent order ingredients GLOW with a subtle pulse animation.
This creates strategic gameplay: "I need orange for the expiring order, path toward it."

---

## Right Side: Kitchen Orders

### Order Queue (Top Section)
- Shows 1-4 pending orders
- Sorted left-to-right by urgency (most urgent = leftmost)
- Each order card shows:
  - Dish icon and name
  - Required ingredients (as icons)
  - Timer bar (visual, not numeric)
  - Border color indicates urgency

### Order Card Design

```
┌─────────────────────────────┐
│  🥤 SMOOTHIE                │
│  [🍎] + [🍌]  →  ✓          │  ← Ingredient icons
│  ████████░░░░░░░░ 8.2s      │  ← Timer bar (green/yellow/red)
└─────────────────────────────┘
```

### Active Order (Middle Section)
When an order is selected (auto or manual), it expands:

```
╔═════════════════════════════════════╗
║  🥤 SMOOTHIE                        ║
║                                     ║
║   [ 🍎 ]  +  [ __ ]  =  🥤          ║  ← Slots being filled
║     ✓        needs 🍌               ║  ← Shows what's still needed
║                                     ║
╚═════════════════════════════════════╝
```

### Ingredient Tray (Bottom Section)
- 6 slots for collected ingredients
- Each slot shows ingredient icon + number key (1-6)
- Ingredients matching current order GLOW
- Empty slots show dotted outline

```
┌─────┬─────┬─────┬─────┬─────┬─────┐
│ 🍎  │ 🍌  │ 🍊  │     │     │     │
│  1  │  2  │  3  │  4  │  5  │  6  │
└─────┴─────┴─────┴─────┴─────┴─────┘
  ↑✨   ↑✨
 GLOWING (matches current order)
```

### Smart Auto-Selection
The game automatically selects the optimal order:
1. Find most urgent order that CAN be completed with current ingredients
2. If none completable, select most urgent (so player knows what to collect)
3. Player can override with Tab or clicking different order

---

## The Focus Switch Mechanic

### Switching (Space Key)
- Instant, no animation delay
- Audio feedback (distinct sounds for each direction)
- Visual transition: 100ms crossfade

### Slow-Mo Details (Worm Side When Kitchen Focused)
- Speed: 25% of normal (600ms vs 150ms per move)
- Visual: Desaturated (grayscale: 0.6)
- Visual: Vignette around edges
- Audio: Low-pass filter on worm sounds
- The worm CONTINUES on its current trajectory

### Danger Proximity Warning
When worm is within 3 cells of self-collision while kitchen focused:
1. Audio: Warning beeps, increasing frequency
2. Visual: Left side border pulses red
3. Visual: "DANGER" text flashes

### The Tension This Creates
- Player is completing an order
- Peripheral vision sees slow-mo worm drifting toward its tail
- Audio beeping starts
- Decision moment: "Finish order or bail?"
- THIS is the core fun loop

---

## Controls

### Universal
| Key | Action |
|-----|--------|
| Space | Switch focus between Worm/Kitchen |
| Escape | Pause game |

### Worm Focus
| Key | Action |
|-----|--------|
| Arrow Keys | Move worm |
| W/A/S/D | Move worm (alternative) |

### Kitchen Focus
| Key | Action |
|-----|--------|
| 1-6 | Add ingredient from tray slot |
| Tab | Select next order |
| Shift+Tab | Select previous order |
| Backspace | Remove last added ingredient |
| T or 7 | Trash selected ingredient (opens trash mode) |

### Mouse Support (Accessibility)
- Click ingredient in tray to add
- Click order card to select
- Click "X" on ingredient to trash

---

## Recipes & Ingredients

### Recipe Design Philosophy
- Recipes are shown ON the orders (no memorization required initially)
- Visual logic: same-color fruits make same-color dishes
- Repetition builds familiarity ("I know smoothie = apple + banana")
- Late game: recipes show as "???", player must remember

### Recipe List

#### 2-Ingredient Recipes (Early Game)
| Recipe | Ingredients | Points | Color Theme |
|--------|-------------|--------|-------------|
| Apple Juice | 🍎 + 🍎 | 50 | Red |
| Smoothie | 🍎 + 🍌 | 60 | Red-Yellow |
| Fruit Punch | 🍊 + 🍓 | 70 | Orange-Pink |
| Grape Juice | 🍇 + 🍇 | 55 | Purple |
| Lemonade | 🍋 + 🍋 | 65 | Yellow |
| Berry Blend | 🍓 + 🍇 | 75 | Pink-Purple |
| Citrus Mix | 🍊 + 🍋 | 70 | Orange-Yellow |
| Tropical | 🍌 + 🥭 | 80 | Yellow-Orange |

#### 3-Ingredient Recipes (Mid Game)
| Recipe | Ingredients | Points | Color Theme |
|--------|-------------|--------|-------------|
| Rainbow Juice | 🍎 + 🍊 + 🍇 | 120 | Multi |
| Sunrise Blend | 🍊 + 🍋 + 🥭 | 130 | Orange family |
| Berry Medley | 🍓 + 🍇 + 🍎 | 125 | Red-Purple |
| Tropical Storm | 🍌 + 🥭 + 🍊 | 140 | Yellow-Orange |
| Garden Fresh | 🍎 + 🍓 + 🍋 | 135 | Mixed |

#### Special Recipes (Late Game)
| Recipe | Ingredients | Points | Special |
|--------|-------------|--------|---------|
| Golden Elixir | 🍋 + 🥭 + 🍌 | 200 | All yellow family |
| Chaos Juice | Any 4 different | 250 | Uses 4 ingredients |
| Perfect Blend | 🍎 + 🍌 + 🍓 + 🍇 | 300 | Specific 4-combo |

---

## UI/UX Specifications

### Information Hierarchy (What Players See First)
1. **URGENT ORDER** - Red border, pulsing, leftmost position
2. **CAN I COMPLETE IT?** - Glowing ingredients in tray
3. **WORM DANGER** - Red vignette on worm side, audio
4. **WHAT DO I NEED?** - Shopping list on worm side

### Timer Visualization
Timers are BARS, not numbers (faster to parse visually):

| Time Left | Bar Color | Border | Animation |
|-----------|-----------|--------|-----------|
| >10s | Green (#50c878) | None | None |
| 5-10s | Yellow (#ffc107) | Yellow glow | None |
| 3-5s | Orange (#ff8c00) | Orange glow | Slow pulse |
| <3s | Red (#ff4444) | Red glow | Fast pulse + shake |

### Color Coding
- **Green**: Safe, good, complete
- **Yellow**: Warning, attention needed
- **Orange**: Urgent, act soon
- **Red**: Critical, immediate action

### Feedback Timing
- Button press to visual response: <16ms (1 frame)
- Order complete animation: 300ms
- Order expire animation: 400ms
- Focus switch transition: 100ms

---

## Visual Design

### Art Style
- **Cute/Friendly**: Rounded corners, soft shadows
- **Clear/Readable**: High contrast, distinct silhouettes
- **Consistent**: Same visual language both sides

### Worm Design
- Head: Rounded, two cute eyes (👀), slight bounce animation
- Body: Segmented, gradient from head color to tail color
- Colors: Green (#50c878) to darker green (#2d8a4e)
- When invincible/powered: Rainbow gradient

### Kitchen Design
- Background: Warm kitchen colors (cream, wood tones)
- Order cards: White with colored borders
- Ingredient tray: Dark wood texture
- Buttons: Tactile, raised appearance

### Animation Priorities
1. **Feedback animations**: Must be instant and clear
2. **Ambient animations**: Subtle, non-distracting (fruit bobbing, steam from dishes)
3. **No blocking animations**: Never prevent player input

---

## Audio Design

### Sound Categories

#### Worm Side
| Event | Sound | Notes |
|-------|-------|-------|
| Eat fruit | Satisfying "pop" | Pitch varies by fruit |
| Near danger | Warning beeps | Frequency increases with proximity |
| Self-collision | Sad splat | Distinct from other sounds |

#### Kitchen Side
| Event | Sound | Notes |
|-------|-------|-------|
| Add ingredient | Click/snap | Confirms action |
| Order complete | Triumphant ding | Very satisfying |
| Order expired | Sad buzzer | Not harsh, more "aww" |
| Wrong ingredient | Soft bonk | Non-punishing |
| Timer critical | Ticking | Builds tension |

#### Focus Switch
| Event | Sound |
|-------|-------|
| Switch to Kitchen | Whoosh + slight reverb |
| Switch to Worm | Whoosh + clarity return |
| Slow-mo active | Low-pass filter on all worm sounds |

### Audio Priorities
- Danger sounds override other sounds
- Feedback sounds are never skipped
- Music (if any) is atmospheric, not distracting

---

## Difficulty Progression

### Time-Based Scaling

| Time | Max Orders | Timer | Tray Size | Recipes | Special |
|------|------------|-------|-----------|---------|---------|
| 0-30s | 1 | 20s | 6 | 3 (2-ingredient) | Tutorial hints |
| 30-60s | 2 | 15s | 6 | 5 recipes | Hints fade |
| 60-90s | 3 | 12s | 5 | 8 recipes | — |
| 90-120s | 3 | 10s | 5 | 10 recipes, 3-ingredient | VIP orders (2x pts) |
| 120-180s | 4 | 8s | 5 | All recipes | Combos |
| 180s+ | 4 | 6s | 4 | All + mystery recipes | Chaos mode |

### Why Tray Size Shrinks
- Early: Room for error, strategic hoarding
- Late: Inventory management matters, must be selective
- Creates new decision layer without adding rules

### Worm Speed Scaling
- Base: 150ms per move
- Every 60s: Decrease by 10ms (faster)
- Minimum: 100ms per move
- Slow-mo always 4x current speed

---

## Scoring System

### Points Sources

| Source | Points | Notes |
|--------|--------|-------|
| Eat fruit | 10 | Basic collection |
| Complete 2-ingredient order | 50-80 | Based on recipe |
| Complete 3-ingredient order | 120-140 | Based on recipe |
| Complete 4-ingredient order | 250-300 | Special recipes |
| Timer bonus | +10-50 | More time left = more points |
| Combo bonus | ×1.5-3.0 | Complete multiple orders per switch |
| Perfect switch | +25 | Switch back with worm in danger zone |
| Close call | +50 | Order completed with <2s remaining |

### Combo System
Complete multiple orders in one kitchen visit for multiplier:
- 2 orders: ×1.5
- 3 orders: ×2.0
- 4 orders: ×3.0

Creates risk/reward: Stay longer for combo, but worm is drifting...

### Penalties
| Event | Penalty |
|-------|---------|
| Order expired | -50 points |
| 3 orders expired | Lose a life |
| Worm dies | Game over |

### Lives System
- Start with 3 lives (hearts)
- Lose 1 life per 3 expired orders
- Lose all lives = Game over (score preserved)
- Worm death = Immediate game over

---

## Game States

### State Machine

```
    ┌──────────────────────────────────────┐
    │                                      │
    ▼                                      │
┌────────┐     ┌────────┐     ┌─────────┐ │
│  MENU  │────▶│  PLAY  │────▶│  PAUSE  │─┘
└────────┘     └────────┘     └─────────┘
    │               │
    │               ▼
    │         ┌───────────┐
    │         │ GAME OVER │
    │         └───────────┘
    │               │
    └───────────────┘
```

### Menu State
- Title: "WORM KITCHEN"
- Subtitle: "Feed the worm. Fulfill the orders."
- High score display
- Start button
- How to Play button (opens tutorial)
- Back to Menu button

### Play State
- Both sides active
- Focus can switch
- Orders spawning
- Timer ticking

### Pause State
- Triggered by Escape
- All timers frozen
- Overlay with Resume/Quit options
- Worm position preserved

### Game Over State
- Final score display
- Statistics (orders completed, fruits eaten, etc.)
- High score check
- Restart button
- Menu button

---

## Technical Specifications

### Architecture

```
worm-kitchen.jsx
├── WormKitchenGame (main component)
│   ├── GameState management
│   ├── Focus state (worm/kitchen)
│   └── Global keyboard handlers
│
├── WormSide (left panel)
│   ├── Grid rendering
│   ├── Worm state & movement
│   ├── Fruit spawning
│   ├── Collision detection
│   └── Slow-mo logic
│
├── KitchenSide (right panel)
│   ├── Order queue management
│   ├── Active order state
│   ├── Ingredient tray
│   ├── Recipe validation
│   └── Timer management
│
└── Shared
    ├── Audio manager
    ├── Particle system
    └── Score tracker
```

### File Structure
```
/home/user/TDRtictactoe/
├── worm-kitchen.html          # HTML wrapper
├── worm-kitchen.jsx           # Main React component
├── menu.html                  # Add new game card
└── docs/
    ├── WORM-KITCHEN.md        # This document
    └── WORM-KITCHEN-PROGRESS.md
```

### Performance Targets
- 60 FPS minimum
- <16ms frame time
- No jank during focus switch
- Efficient re-renders (React.memo where needed)

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### localStorage Keys
- `worm_kitchen_highscore`: Number
- `worm_kitchen_stats`: JSON object with play statistics
- `worm_kitchen_settings`: Audio/visual preferences

---

## Accessibility

### Visual
- High contrast mode option
- Colorblind-friendly palette option
- Larger UI scale option
- Reduced motion option (disables non-essential animations)

### Audio
- All critical info has visual redundancy
- Volume controls for SFX/Music separately
- Mute option

### Motor
- Mouse-only mode available
- Keyboard-only mode (default)
- Adjustable game speed option
- Pause available anytime

### Cognitive
- Tutorial mode with hints
- Practice mode (no timers)
- Recipe reference always accessible

---

## Appendix: Base Game Reference

This game is based on **RPG Snake** (`snake.jsx`), reusing:
- Grid system and cell rendering
- Worm movement and direction logic
- Collision detection
- Particle effects
- State management patterns
- Keyboard input handling
- Visual styling approach

Key differences from RPG Snake:
- No enemy system (removed)
- No wave/boss system (removed)
- Added split-screen layout
- Added kitchen side entirely new
- Added focus switching mechanic
- Added order/recipe system
- Modified speed system for slow-mo

---

## Appendix: Development Phases

### Phase 1: Core Worm
- Split-screen layout
- Worm movement (adapted from snake.jsx)
- Fruit spawning and collection
- Basic ingredient tray (no recipes yet)

### Phase 2: Kitchen System
- Order queue rendering
- Recipe validation
- Timer system
- Order completion flow

### Phase 3: Focus Switching
- Space to switch
- Slow-mo implementation
- Visual/audio transitions
- Danger proximity system

### Phase 4: Polish
- Particle effects
- Audio implementation
- Score/combo system
- High score persistence

### Phase 5: Balance & Testing
- Difficulty curve tuning
- Recipe balance
- Timer tuning
- Playtest iteration

---

*Document Version: 1.0*
*Last Updated: 2025-01-17*
*Status: Design Complete - Ready for Development*
