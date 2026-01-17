# RPG Snake - Development Handoff Document

This document explains the current implementation state and planned features for the RPG Snake game. Use this to continue development.

---

## Project Overview

**Goal:** Transform a basic snake game into an engaging RPG experience with progression, missions, and meaningful choices.

**Files:**
- `snake.html` - Entry point, loads React/Babel and snake.jsx
- `snake.jsx` - All game logic (~2300+ lines of React)
- `SNAKE.md` - Player-facing documentation

**Tech Stack:**
- React 18 with in-browser Babel JSX compilation
- No build step required - runs directly in browser
- localStorage for persistence

---

## What's Been Implemented

### Phase 1: RPG Progression System (COMPLETE)

#### XP & Leveling
```javascript
const XP_PER_LEVEL = 100;
const MAX_LEVEL = 50;

// XP required for each level uses exponential curve
const getXpForLevel = (level) => Math.floor(XP_PER_LEVEL * Math.pow(1.1, level - 1));
```

- Players earn XP from eating food (each food type has different XP values)
- Bonus XP (+20) for completing waves
- Level ups unlock new content

#### Level-Gated Unlocks
```javascript
const UNLOCKS = {
  3: { type: 'ability', id: 'dash', name: 'Dash Ability' },
  5: { type: 'powerup', id: 'shield', name: 'Shield Power-up' },
  10: { type: 'powerup', id: 'magnet', name: 'Magnet Power-up' },
  15: { type: 'powerup', id: 'double_points', name: 'Double Points Power-up' },
  20: { type: 'skin', id: 'golden', name: 'Golden Snake Skin' },
  30: { type: 'skin', id: 'neon', name: 'Neon Snake Skin' },
  40: { type: 'skin', id: 'fire', name: 'Fire Snake Skin' },
  50: { type: 'skin', id: 'cosmic', name: 'Cosmic Snake Skin' },
};
```

#### Dash Ability (Level 3+)
- Press SPACE to dash forward 3 tiles
- Invincible during dash
- 8 second cooldown
- Visual particle effects on use

```javascript
const DASH_COOLDOWN = 8000; // ms
const DASH_DISTANCE = 3; // tiles
```

#### New Power-Ups
| Power-Up | Level Req | Effect |
|----------|-----------|--------|
| Shield | 5 | Blocks one hit (enemy/wall/self collision) |
| Magnet | 10 | Attracts food within 3 tiles for 5 seconds |
| Double Points | 15 | 2x score and XP for 8 seconds |

#### Snake Skins
```javascript
const snakeSkins = {
  default: { head: '#4CAF50', body: '#45a049', name: 'Classic' },
  golden: { head: '#FFD700', body: '#FFA500', name: 'Golden' },
  neon: { head: '#00FFFF', body: '#FF00FF', name: 'Neon' },
  fire: { head: '#FF4500', body: '#FF6347', name: 'Fire' },
  cosmic: { head: '#9400D3', body: '#4B0082', name: 'Cosmic' },
};
```

#### Coins
- Earned on game over: `floor(score / 10) + (wave * 5)`
- Stored in stats, ready for shop system

#### Stats State Structure
```javascript
stats = {
  totalScore: 0,
  gamesPlayed: 0,
  enemiesDefeated: {}, // { enemyId: count }
  highScores: {}, // { enemyId: score }
  xp: 0,
  level: 1,
  totalXpEarned: 0,
  unlockedAbilities: [], // ['dash']
  unlockedSkins: ['default'], // skin ids
  selectedSkin: 'default',
  coins: 0,
};
```

**localStorage key:** `snake_rpg_stats`

---

### Phase 2: Mission System (COMPLETE)

#### Mission Types
```javascript
const MISSION_TYPES = {
  collect_food: {
    name: 'Collector',
    desc: (t) => `Eat ${t} food in one run`,
    icon: '🍎',
    targets: [10, 15, 20, 30],
    xpReward: [30, 50, 75, 100],
    coinReward: [15, 25, 40, 60]
  },
  collect_bonus: {
    name: 'Bonus Hunter',
    desc: (t) => `Eat ${t} bonus food (oranges)`,
    icon: '🍊',
    targets: [3, 5, 8],
    xpReward: [40, 60, 90],
    coinReward: [20, 35, 50]
  },
  collect_super: {
    name: 'Star Chaser',
    desc: (t) => `Eat ${t} super food (stars)`,
    icon: '⭐',
    targets: [2, 3, 5],
    xpReward: [50, 75, 120],
    coinReward: [25, 40, 65]
  },
  reach_wave: {
    name: 'Wave Rider',
    desc: (t) => `Reach wave ${t}`,
    icon: '🌊',
    targets: [3, 5, 7, 10],
    xpReward: [40, 70, 100, 150],
    coinReward: [20, 40, 60, 100]
  },
  reach_score: {
    name: 'High Scorer',
    desc: (t) => `Reach ${t} points`,
    icon: '🏆',
    targets: [200, 400, 600, 1000],
    xpReward: [35, 60, 90, 140],
    coinReward: [18, 35, 55, 85]
  },
  reach_length: {
    name: 'Long Snake',
    desc: (t) => `Reach length ${t}`,
    icon: '📏',
    targets: [10, 15, 20, 25],
    xpReward: [30, 50, 80, 120],
    coinReward: [15, 30, 50, 75]
  },
  use_dash: {
    name: 'Dash Master',
    desc: (t) => `Use dash ${t} times`,
    icon: '💨',
    targets: [3, 5, 8],
    xpReward: [35, 55, 85],
    coinReward: [18, 30, 50],
    levelReq: 3
  },
  collect_powerups: {
    name: 'Power Collector',
    desc: (t) => `Collect ${t} power-ups`,
    icon: '💎',
    targets: [3, 5, 8],
    xpReward: [40, 65, 100],
    coinReward: [20, 35, 60]
  },
  no_damage: {
    name: 'Untouchable',
    desc: () => `Complete a run without using shield`,
    icon: '🛡️',
    targets: [1],
    xpReward: [80],
    coinReward: [45],
    levelReq: 5
  },
  beat_enemy: {
    name: 'Enemy Slayer',
    desc: (t, e) => `Beat ${e}`,
    icon: '💀',
    targets: ['slime', 'scorpion', 'fox', 'wizard', 'tiger'],
    xpReward: [50, 70, 90, 110, 130],
    coinReward: [30, 45, 60, 75, 90]
  },
};
```

#### Mission State
```javascript
missions = {
  active: [
    { type: 'collect_food', targetIndex: 1, progress: 0, completed: false },
    { type: 'reach_wave', targetIndex: 0, progress: 0, completed: false },
    { type: 'use_dash', targetIndex: 0, progress: 0, completed: false },
  ],
  lastRefresh: Date.now(), // daily refresh
};
```

**localStorage key:** `snake_missions`

#### Mission Tracking Variables (reset each game)
```javascript
// In-game tracking state
const [missionProgress, setMissionProgress] = useState({});
const [completedMissions, setCompletedMissions] = useState([]);
const [dashesUsed, setDashesUsed] = useState(0);
const [powerUpsCollected, setPowerUpsCollected] = useState(0);
const [shieldUsed, setShieldUsed] = useState(false);
const [wavesWithoutShield, setWavesWithoutShield] = useState(0);
const [bonusFoodCount, setBonusFoodCount] = useState(0);
const [superFoodCount, setSuperFoodCount] = useState(0);
const [totalFoodCount, setTotalFoodCount] = useState(0);
```

#### Mission Flow
1. Missions generate on first load (3 active)
2. Missions checked on game over via `checkMissionProgress()`
3. Completed missions award XP + coins
4. New missions regenerate to replace completed ones
5. All missions refresh daily

---

## Existing Game Systems (Pre-RPG)

### Enemy System
10 enemies, each with unique:
- Grid size (12x12 to 22x22)
- Speed (game loop interval)
- Gimmick mechanic
- Themed world (CSS gradient background + decorations)

### Food System
```javascript
const foodTypes = {
  normal: { emoji: '🍎', points: 10, xp: 5 },
  bonus: { emoji: '🍊', points: 25, xp: 12 },
  super: { emoji: '⭐', points: 50, xp: 25 },
  power: { emoji: '💎', points: 30, xp: 15 }, // invincibility
  speed: { emoji: '⚡', points: 15, xp: 8 }, // speed boost
  shrink: { emoji: '🍃', points: 20, xp: 10 }, // reduce length
  shield: { emoji: '🛡️', points: 20, xp: 15, levelReq: 5 },
  magnet: { emoji: '🧲', points: 15, xp: 12, levelReq: 10 },
  double_points: { emoji: '✨', points: 10, xp: 10, levelReq: 15 },
  boss: { emoji: '💀', points: 100, xp: 50 }, // boss waves only
};
```

### Wave System
- Normal waves: collect target food count
- Boss waves: every 5th wave, defeat boss by collecting skull food
- Speed increases each wave (5ms faster, min 60ms)

### Status Effects
- Invincible (5s from power food)
- Speed boost (4s)
- Slowed (from slime/zones)
- Reversed controls (Mirror Mantis)
- Shield (until hit)
- Magnet (5s)
- Double Points (8s)

---

## Planned Future Phases

### Phase 3: Shop System (COMPLETE)

**Concept:** Spend coins on permanent upgrades

#### Shop Items
```javascript
const SHOP_ITEMS = {
  xp_boost: { name: 'XP Boost', desc: '+10% XP per level', icon: '📈', baseCost: 200, maxLevel: 5 },
  coin_boost: { name: 'Coin Boost', desc: '+15% coins per level', icon: '💰', baseCost: 200, maxLevel: 5 },
  dash_distance: { name: 'Dash Range', desc: '+1 dash distance', icon: '💨', baseCost: 300, maxLevel: 2, reqLevel: 3 },
  dash_cooldown: { name: 'Quick Dash', desc: '-1s dash cooldown', icon: '⏱️', baseCost: 400, maxLevel: 3, reqLevel: 3 },
  magnet_range: { name: 'Super Magnet', desc: '+1 magnet range', icon: '🧲', baseCost: 350, maxLevel: 2, reqLevel: 10 },
  magnet_duration: { name: 'Lasting Magnet', desc: '+2s magnet duration', icon: '⏰', baseCost: 300, maxLevel: 2, reqLevel: 10 },
  shield_charges: { name: 'Fortified Shield', desc: '+1 shield charge', icon: '🛡️', baseCost: 500, maxLevel: 2, reqLevel: 5 },
  starting_length: { name: 'Head Start', desc: '+1 starting length', icon: '📏', baseCost: 250, maxLevel: 3 },
  double_duration: { name: 'Extended Double', desc: '+3s double points', icon: '✨', baseCost: 350, maxLevel: 2, reqLevel: 15 },
};
```

#### Helper Functions
```javascript
const getShopLevel = (itemId) => stats.shopPurchases[itemId] || 0;
const getShopCost = (itemId) => {
  const item = SHOP_ITEMS[itemId];
  const currentLevel = getShopLevel(itemId);
  return Math.floor(item.baseCost * Math.pow(1.5, currentLevel)); // Cost scales 1.5x per level
};
const canBuyShopItem = (itemId) => {
  const item = SHOP_ITEMS[itemId];
  const currentLevel = getShopLevel(itemId);
  if (currentLevel >= item.maxLevel) return false;
  if (item.reqLevel && stats.level < item.reqLevel) return false;
  return stats.coins >= getShopCost(itemId);
};
```

#### Stats State (updated)
```javascript
stats = {
  // ... existing fields ...
  shopPurchases: {}, // { itemId: purchaseLevel }
};
```

#### Where Upgrades Apply
- **xp_boost**: `handleGameOver()` - multiplies total XP by `1 + (level * 0.1)`
- **coin_boost**: `handleGameOver()` - multiplies coins by `1 + (level * 0.15)`
- **dash_distance**: `performDash()` - adds to DASH_DISTANCE
- **dash_cooldown**: `performDash()` - subtracts `level * 1000ms` from cooldown
- **magnet_range**: Game loop food collision - adds to base 3-tile range
- **magnet_duration**: Food effect - adds `level * 2000ms` to 5s base
- **shield_charges**: Food effect - adds `level` extra charges per pickup
- **starting_length**: `startGame()` - adds to initial snake length
- **double_duration**: Food effect - adds `level * 3000ms` to 8s base

#### Shield System Change
Shield was converted from boolean to charges:
```javascript
const [shieldCharges, setShieldCharges] = useState(0);
const hasShield = shieldCharges > 0; // backwards compatibility
```

#### UI
- Shop accessible via "SHOP" button on main menu
- Shows current coins, all items with levels, costs, and lock status
- Items with `reqLevel` show "Lv X+" when locked
- Maxed items show "MAX" in green

---

### Phase 4: Polish & Additional Content (COMPLETE)

**Includes:** Achievements, new abilities, new skins

#### New Abilities

**Slow Time (Level 8)**
```javascript
// State
const [slowmoCooldown, setSlowmoCooldown] = useState(0);
const [isSlowmo, setIsSlowmo] = useState(false);
const SLOWMO_COOLDOWN = 15000; // 15 seconds
const SLOWMO_DURATION = 4000;  // 4 seconds

// Press Q to activate
// Doubles game interval (half speed) for 4 seconds
```

**Phase (Level 12)**
```javascript
// State
const [phaseCooldown, setPhaseCooldown] = useState(0);
const [isPhasing, setIsPhasing] = useState(false);
const PHASE_COOLDOWN = 20000; // 20 seconds
const PHASE_DURATION = 3000;  // 3 seconds

// Press E to activate
// Pass through walls and self-collision for 3 seconds
// Adds 'phasing' to activeEffects
```

#### New Skins (8 total)

```javascript
const snakeSkins = {
  default: { head: 'linear-gradient(135deg, #70ee90, #50c878)', body: '...', glow: '...' },
  ocean: { ... },    // Level 18 - Teal/cyan
  golden: { ... },   // Level 20 - Gold
  electric: { ... }, // Level 25 - Bright green/lime
  neon: { ... },     // Level 30 - Cyan/magenta
  rainbow: { ... },  // Level 35 - Multi-color
  fire: { ... },     // Level 40 - Orange/red
  shadow: { ... },   // Level 45 - Dark gray/black
  cosmic: { ... },   // Level 50 - Purple/blue
};
```

#### UNLOCKS Updated

```javascript
const UNLOCKS = {
  3: { type: 'ability', id: 'dash', name: 'Dash Ability' },
  5: { type: 'powerup', id: 'shield', name: 'Shield Power-up' },
  8: { type: 'ability', id: 'slowmo', name: 'Slow Time Ability' },
  10: { type: 'powerup', id: 'magnet', name: 'Magnet Power-up' },
  12: { type: 'ability', id: 'phase', name: 'Phase Ability' },
  15: { type: 'powerup', id: 'double_points', name: 'Double Points Power-up' },
  18: { type: 'skin', id: 'ocean', name: 'Ocean Snake Skin' },
  20: { type: 'skin', id: 'golden', name: 'Golden Snake Skin' },
  25: { type: 'skin', id: 'electric', name: 'Electric Snake Skin' },
  30: { type: 'skin', id: 'neon', name: 'Neon Snake Skin' },
  35: { type: 'skin', id: 'rainbow', name: 'Rainbow Snake Skin' },
  40: { type: 'skin', id: 'fire', name: 'Fire Snake Skin' },
  45: { type: 'skin', id: 'shadow', name: 'Shadow Snake Skin' },
  50: { type: 'skin', id: 'cosmic', name: 'Cosmic Snake Skin' },
};
```

#### Achievements (25 total)
```javascript
const ACHIEVEMENTS = {
  // Progression (5)
  first_game: { name: 'First Steps', desc: 'Play your first game', icon: '👶', reward: 25 },
  level_5: { name: 'Getting Started', desc: 'Reach level 5', icon: '⭐', reward: 50 },
  level_10: { name: 'Rising Star', desc: 'Reach level 10', icon: '🌟', reward: 100 },
  level_25: { name: 'Veteran', desc: 'Reach level 25', icon: '💫', reward: 250 },
  level_50: { name: 'Master', desc: 'Reach max level', icon: '👑', reward: 500 },
  // Score (3)
  score_500/1000/2500: 50/100/200 coins
  // Waves (3)
  wave_5/10/15: 40/100/200 coins
  // Length (2)
  length_20/35: 50/150 coins
  // Enemies (4)
  beat_slime, beat_3/5/all enemies: 30/75/150/500 coins
  // Cumulative (6)
  food_100/500/1000: 30/75/150 coins
  games_10/50/100: 40/100/200 coins
  // Special (3)
  no_powerups (wave 5 without power-ups): 100 coins
  dash_master (50 total dashes): 75 coins
  coins_1000 (accumulate 1000 coins): 100 coins
};
```

#### Stats State (updated)
```javascript
stats = {
  // ... existing fields ...
  achievements: [], // list of unlocked achievement ids
  totalFood: 0,     // cumulative food eaten
  totalDashes: 0,   // cumulative dashes used
  maxScore: 0,      // best single-game score
  maxWave: 0,       // best single-game wave
  maxLength: 0,     // best single-game length
};
```

#### checkAchievements Function
- Called at end of handleGameOver with gameData and updatedStats
- Returns array of newly earned achievement ids
- Achievement rewards (coins) added to stats.coins
- Newly earned achievements stored in newAchievements state for display

#### UI
- "ACHIEVEMENTS (X/25)" button on main menu
- Achievements panel shows all 25 with unlock status
- Locked achievements are grayed out with reward preview
- Unlocked achievements show checkmark
- New achievements displayed on game over screen with reward

#### Stats Screen

Accessible via "STATS" button on main menu. Displays:

**Summary Grid (6 stats):**
- Games Played, Total Score, Total XP
- Avg Score, Avg Food/Game, Coins

**Personal Bests (Bar Chart):**
- Best Score (max 2500 for display scaling)
- Best Wave (max 20)
- Best Length (max 50)

**Lifetime Progress (Milestones):**
- Food Eaten (target: 1000)
- Games Played (target: 100)
- Total Dashes (target: 50)
- Coins Earned (target: 1000)

---

## Key Helper Functions

```javascript
// Check if player has unlocked an ability
const hasAbility = (abilityId) => stats.unlockedAbilities.includes(abilityId);

// Check if power-up is unlocked
const isPowerUpUnlocked = (powerUpId) => {
  const unlock = Object.values(UNLOCKS).find(u => u.type === 'powerup' && u.id === powerUpId);
  if (!unlock) return true;
  const level = Object.keys(UNLOCKS).find(l => UNLOCKS[l] === unlock);
  return stats.level >= parseInt(level);
};

// Get current skin colors
const getCurrentSkin = () => snakeSkins[stats.selectedSkin] || snakeSkins.default;

// XP calculations
const getXpForLevel = (level) => Math.floor(XP_PER_LEVEL * Math.pow(1.1, level - 1));
const getTotalXpForLevel = (level) => {
  let total = 0;
  for (let i = 1; i < level; i++) total += getXpForLevel(i);
  return total;
};
```

---

## UI Locations

### Main Menu Shows:
- Player level + XP bar
- Coins
- SELECT ENEMY button
- SHOP button (gold)
- ACHIEVEMENTS button (purple) with progress count
- Next unlock preview
- Active missions panel (3 missions with progress)

### In-Game Shows:
- Dash button with cooldown indicator (if level 3+)
- Active power-up indicators (shield with charge count, magnet, double points)
- Standard HUD (score, wave, length, etc.)

### Game Over Shows:
- XP earned this game
- Level progress bar
- Level up notifications with unlocks
- Completed missions with rewards
- New achievements unlocked with coin rewards
- Coins earned

---

## Important Implementation Details

1. **Stats Migration:** The stats loading includes migration for old save files that don't have the new RPG fields. Always provide defaults.

2. **Power-Up Spawning:** Level-gated power-ups only spawn if player meets level requirement via `isPowerUpUnlocked()` check in `spawnFood()`.

3. **Shield Mechanics:** Shield is consumed on ANY collision (self, wall, enemy hazard). Check `hasShield` state before applying damage.

4. **Mission Progress:** Track during gameplay, check on game over. Don't award partial mission progress between games.

5. **Dash Particles:** Creates visual particle effects when dashing. Particles are purely cosmetic.

6. **Daily Mission Refresh:** Compare `missions.lastRefresh` to current date. If different day, regenerate all missions.

---

## Testing Notes

- Start a new game to test XP gain and leveling
- Clear localStorage to test fresh player experience
- Test level-gated content by manually setting stats.level
- Missions can be tested by modifying mission targets to low values

---

## User Preferences (from conversation)

- User explicitly said NO to multiplayer/co-op features
- User wanted RPG elements, missions, power-ups - all implemented
- User liked the idea of unique snake skins as rewards
- User wanted the game to be "less boring" - hence the progression systems
