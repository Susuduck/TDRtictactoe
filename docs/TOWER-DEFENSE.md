# Tower Defense - Complete Game Documentation

A feature-rich mazing tower defense game with 10 unique worlds, dynamic level progression, and strategic depth inspired by Infinitode 2.

## Overview

Tower Defense is a browser-based React game featuring:
- **10 Unique Worlds** - Each with distinct themes, enemies, and gimmick mechanics
- **10 Levels Per World** - 109 waves per world with varying difficulty
- **Unique Map Layouts** - Each level has a different path configuration
- **7 Tower Types** - Each with 3 upgrade tiers
- **9 Enemy Types + 10 Bosses** - Diverse enemies with resistances and special abilities
- **World Gimmicks** - Unique environmental challenges per world

---

## Level System (Infinitode 2-Inspired)

Each world contains 10 levels, each with a specific number of waves:

| Level | Name | Waves | Boss Type | Description |
|-------|------|-------|-----------|-------------|
| 1 | Outskirts | 5 | None | A gentle introduction |
| 2 | Crossroads | 6 | None | The path splits |
| 3 | The Gauntlet | 8 | Mini | A test of endurance |
| 4 | Winding Path | 8 | None | Enemies take the long way |
| 5 | Stronghold | 10 | Major | The first real challenge |
| 6 | The Maze | 10 | None | A labyrinth of danger |
| 7 | Twin Rivers | 12 | Mini | Enemies from two directions |
| 8 | The Crucible | 14 | None | Only the strong survive |
| 9 | Last Stand | 16 | Mini | The final preparation |
| 10 | The Throne | 20 | Final | Face the world boss |

**Total: 109 waves per world**

### Boss Types
- **Mini-Boss**: 2-3 tanks + shielded enemies + support
- **Major Boss**: Dragon + support enemies
- **Final Boss**: World-specific boss with unique abilities

---

## Map Layouts

Each level features a unique map layout with different entry/exit points and obstacle patterns:

| Level | Layout Name | Start | End | Description |
|-------|-------------|-------|-----|-------------|
| 1 | The Trail | Top-center | Bottom-center | Simple S-curve (tutorial) |
| 2 | The Corner | Top-left | Bottom-right | L-shaped path |
| 3 | The Serpent | Top-right | Bottom-right | Zigzag pattern |
| 4 | The Vortex | Top-left | Center | Spiral inward |
| 5 | The Horseshoe | Top-left | Top-right | U-turn double-back |
| 6 | The Diamond | Left-center | Right-center | Diamond/cross pattern |
| 7 | The Fork | Top-center | Bottom-center | Two paths merging |
| 8 | The Labyrinth | Top-left | Bottom-right | Complex maze |
| 9 | The Fortress | Top-center | Bottom-center | Central fortress obstacle |
| 10 | The Throne Room | Top-center | Center | Complex spiral with islands |

### Obstacle Tiles
- Obstacles are shown with world-themed decorations
- Cannot place towers on obstacles
- Forces strategic path planning

---

## Worlds

### World 1: Forest Fawn
- **Character**: The Woodland Guide
- **Color**: Green (#50c878)
- **Gimmick**: None (Tutorial)
- **Enemies**: Slime, Swarm
- **Boss**: Giant Treant

### World 2: Sandy Scorpion
- **Character**: The Desert Dweller
- **Color**: Gold (#e8a840)
- **Gimmick**: Sandstorm - Reduces tower range by 40% every 20s for 5s
- **Enemies**: Scout, Swarm, Slime
- **Boss**: Sand Wurm (splits on death)

### World 3: Glacier Penguin
- **Character**: The Frozen Guardian
- **Color**: Ice Blue (#70c9ff)
- **Gimmick**: Blizzard - Slows tower attack speed by 60% every 20s for 5s
- **Enemies**: Tank, Shielded, Slime
- **Boss**: Ice Giant (shield + frost resistance)

### World 4: Swamp Toad
- **Character**: The Murky Master
- **Color**: Swamp Green (#7cb342)
- **Gimmick**: Fog Zones - Every 4th path tile heals enemies 0.5% HP/frame
- **Enemies**: Healer, Splitter, Slime, Swarm
- **Boss**: Hydra (heals + splits)

### World 5: Volcano Dragon
- **Character**: The Flame Lord
- **Color**: Flame Orange (#ff6b35)
- **Gimmick**: Lava Eruption - Random tiles erupt, disabling towers for 3s
- **Enemies**: Tank, Scout, Slime (fire resistant)
- **Boss**: Elder Dragon (fire immunity)

### World 6: Crystal Moth
- **Character**: The Light Seeker
- **Color**: Crystal Purple (#c990ff)
- **Gimmick**: Invisible - 40% of enemies spawn invisible
- **Enemies**: Scout, Swarm, Slime
- **Boss**: Shadow Beast (always invisible)

### World 7: Storm Eagle
- **Character**: The Sky Sovereign
- **Color**: Storm Blue (#5090e8)
- **Gimmick**: Lightning - Random strikes damage enemies/towers every 3-5s
- **Enemies**: Scout, Shielded, Healer (lightning resistant)
- **Boss**: Thunder Roc

### World 8: Haunted Ghost
- **Character**: The Spirit Keeper
- **Color**: Ghost Gray (#a0a0c0)
- **Gimmick**: Resurrect - Enemies resurrect once at 50% HP
- **Enemies**: Splitter, Healer, Tank
- **Boss**: Lich King (resurrects twice)

### World 9: Clockwork Robot
- **Character**: The Machine Mind
- **Color**: Bronze (#c0a080)
- **Gimmick**: Time Warp - Every 3rd path tile speeds up enemies 2x
- **Enemies**: Shielded, Tank, Scout
- **Boss**: Mech Titan (massive shield)

### World 10: Cosmic Owl
- **Character**: The Final Wisdom
- **Color**: Cosmic Gold (#d4a840)
- **Gimmick**: Chaos - Random gimmick selected each wave
- **Enemies**: All types
- **Boss**: Void Emperor (resists all damage types)

---

## Towers

| Tower | Cost | Damage | Range | Special | Damage Type |
|-------|------|--------|-------|---------|-------------|
| Arrow | 30g | 12 | 3.5 | 15% crit chance | Physical |
| Cannon | 60g | 45 | 2.8 | Splash damage (1.2 radius) | Fire |
| Sniper | 80g | 75 | 6.0 | Long range | Physical |
| Frost | 50g | 8 | 3.0 | Slows 40% for 2.5s | Frost |
| Tesla | 100g | 20 | 3.2 | Chain lightning (4 targets) | Lightning |
| Plague | 70g | 5 | 2.5 | Poison DoT + AoE poison | Poison |
| Laser | 120g | 3/tick | 4.0 | Continuous beam | Fire |

### Upgrade Tiers
Each tower has 3 upgrade tiers with increasing stats:
- **Tier 1**: Minor stat boost (40-80g)
- **Tier 2**: Significant upgrade (90-150g)
- **Tier 3**: Ultimate form (150-250g)

---

## Enemies

| Enemy | Health | Speed | Reward | Special |
|-------|--------|-------|--------|---------|
| Slime | 40 | 0.9 | 6g | Basic enemy |
| Scout | 25 | 1.8 | 8g | Fast, fragile |
| Tank | 180 | 0.45 | 18g | Slow, tanky, physical resist |
| Swarm | 15 | 1.4 | 4g | Weak but numerous |
| Healer | 60 | 0.7 | 14g | Heals nearby enemies |
| Knight | 100 | 0.6 | 21g | 50 shield |
| Amoeba | 80 | 0.8 | 10g | Splits into 2 bugs on death |
| Dragon | 800 | 0.35 | 100g | Boss (every 5 levels) |
| Titan | 2000 | 0.25 | 200g | Mega boss |

### Resistance System
Enemies have resistances to damage types:
- **Positive**: Takes less damage (e.g., +0.5 = 50% reduction)
- **Negative**: Takes more damage (e.g., -0.3 = 30% bonus damage)
- **Zero**: Normal damage

---

## Abilities

| Ability | Cost | Cooldown | Effect |
|---------|------|----------|--------|
| Bomb (Q) | 50g | 30s | Deal 25% max HP to all enemies |
| Freeze (W) | 30g | 20s | Freeze all enemies for 3 seconds |

---

## Progression System

### Stars
- **1 star per level completed** (10 stars per world max)
- **8 stars required** to unlock the next world
- Progress saved to localStorage

### Gold Economy
- **Starting gold**: 100 + (worldId × 20) + (level × 10)
- **Wave bonus**: 25 + (wave × 8) + (level × 5) + (world × 3)
- **Level bonus**: 50 + (level × 20)
- **Tower sell value**: 60% of total cost
- **Combo bonus**: Up to 50x multiplier for rapid kills

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| 1-7 | Select tower type |
| Space | Start wave |
| Escape | Cancel selection |
| U | Upgrade selected tower |
| S | Sell selected tower |
| Q | Use Bomb ability |
| W | Use Freeze ability |

---

## Technical Details

### Requirements
- Modern browser with JavaScript enabled
- Works offline (no server required)
- Responsive design (landscape and portrait)

### Performance Features
- 60 FPS game loop with delta time
- Particle system with FPS-based throttling
- Pre-computed pathfinding cache
- Reduced motion support

### Integration
Single-session mode for embedding:
```
tower-defense.html?session=true&world=2&callback=parent.towerDefenseComplete
```

---

## Strategy Tips

1. **Level Layout Matters**: Study each level's map layout - some have longer natural paths
2. **Tower Synergy**: Frost + high-damage towers = deadly combination
3. **Economy Management**: Don't overbuild early - save for upgrades
4. **Gimmick Awareness**: Plan around world gimmicks (e.g., build outside lava zones)
5. **Combo Chasing**: Kill enemies quickly for bonus gold
6. **Boss Preparation**: Save abilities for boss waves
7. **Resistance Matching**: Use the right damage type for each enemy

---

## File Structure

- `tower-defense.html` - Main game file (standalone, no dependencies)
- `tower-defense.jsx` - Source React component
- `docs/TOWER-DEFENSE.md` - This documentation
- `docs/TODO-TOWER-DEFENSE-GIMMICKS.md` - Gimmick implementation reference

---

## Version History

### v2.0 - Level System Update
- Changed from 10 waves to 10 levels (109 waves total per world)
- Added unique map layouts for each level
- Added world background art and decorations
- Added obstacle tiles with themed decorations
- Updated progression system for level-based stars
- Improved wave generation with level-based scaling

### v1.0 - Initial Release
- 10 worlds with unique gimmicks
- 7 tower types with upgrades
- 9 enemy types + 10 bosses
- Combo system and abilities
- Single-session integration mode
