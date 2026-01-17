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

### Phase 3: Shop System (NOT STARTED)

**Concept:** Spend coins on permanent upgrades

**Suggested Shop Items:**
```javascript
const SHOP_ITEMS = {
  // Permanent stat boosts
  xp_boost: { name: 'XP Boost', desc: '+10% XP gain', cost: 500, maxLevel: 5 },
  coin_boost: { name: 'Coin Boost', desc: '+10% coin gain', cost: 500, maxLevel: 5 },
  starting_length: { name: 'Starting Length', desc: '+1 starting length', cost: 300, maxLevel: 3 },

  // Ability upgrades
  dash_distance: { name: 'Dash Distance', desc: '+1 dash distance', cost: 400, maxLevel: 2 },
  dash_cooldown: { name: 'Dash Cooldown', desc: '-1s dash cooldown', cost: 600, maxLevel: 3 },

  // Power-up duration
  shield_charges: { name: 'Shield Charges', desc: 'Shield blocks +1 hit', cost: 800, maxLevel: 2 },
  magnet_range: { name: 'Magnet Range', desc: '+1 magnet range', cost: 500, maxLevel: 2 },
  magnet_duration: { name: 'Magnet Duration', desc: '+2s magnet duration', cost: 400, maxLevel: 2 },

  // Consumables (buy before game)
  extra_life: { name: 'Extra Life', desc: 'Revive once per game', cost: 200, consumable: true },
  score_multiplier: { name: 'Score Boost', desc: '1.5x score for one game', cost: 150, consumable: true },
};
```

**Implementation Notes:**
- Add `shopPurchases` to stats state
- Create shop UI accessible from main menu
- Apply upgrades in game logic (check shopPurchases)
- Consumables reset each game

---

### Phase 4: Achievement System (NOT STARTED)

**Concept:** Long-term goals with badges and bonus rewards

**Suggested Achievements:**
```javascript
const ACHIEVEMENTS = {
  // Progression
  first_win: { name: 'First Victory', desc: 'Beat any enemy', reward: 50 },
  level_10: { name: 'Getting Stronger', desc: 'Reach level 10', reward: 100 },
  level_25: { name: 'Experienced', desc: 'Reach level 25', reward: 250 },
  level_50: { name: 'Master', desc: 'Reach max level', reward: 500 },

  // Enemies
  beat_all: { name: 'Champion', desc: 'Beat all 10 enemies', reward: 300 },
  wyrm_slayer: { name: 'Wyrm Slayer', desc: 'Beat Eternal Wyrm', reward: 200 },

  // Score
  score_1000: { name: 'High Scorer', desc: 'Score 1000 in one game', reward: 75 },
  score_5000: { name: 'Score Legend', desc: 'Score 5000 in one game', reward: 200 },

  // Length
  length_30: { name: 'Long Boi', desc: 'Reach length 30', reward: 100 },
  length_50: { name: 'Endless Snake', desc: 'Reach length 50', reward: 200 },

  // Waves
  wave_10: { name: 'Wave Surfer', desc: 'Reach wave 10', reward: 75 },
  wave_20: { name: 'Wave Master', desc: 'Reach wave 20', reward: 150 },

  // Special
  no_powerups: { name: 'Purist', desc: 'Beat an enemy without power-ups', reward: 100 },
  speedrun: { name: 'Speed Demon', desc: 'Beat Slime King in under 2 minutes', reward: 150 },
  pacifist: { name: 'Pacifist', desc: 'Beat a boss wave without taking damage', reward: 125 },

  // Cumulative
  total_food_1000: { name: 'Hungry', desc: 'Eat 1000 total food', reward: 100 },
  total_food_10000: { name: 'Insatiable', desc: 'Eat 10000 total food', reward: 300 },
  games_100: { name: 'Dedicated', desc: 'Play 100 games', reward: 150 },
};
```

**Implementation Notes:**
- Add `achievements` array to stats (list of unlocked achievement ids)
- Add `cumulativeStats` to stats for tracking totals
- Check achievements on game over
- Show achievement popup when unlocked
- Add achievements panel to main menu

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
- Next unlock preview
- Active missions panel (3 missions with progress)

### In-Game Shows:
- Dash button with cooldown indicator (if level 3+)
- Active power-up indicators (shield, magnet, double points)
- Standard HUD (score, wave, length, etc.)

### Game Over Shows:
- XP earned this game
- Level progress bar
- Level up notifications with unlocks
- Completed missions with rewards
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
