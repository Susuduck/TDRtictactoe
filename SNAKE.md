# RPG Snake

A feature-rich snake game with RPG elements, unique enemies, and themed worlds.

## Quick Start

1. Open `snake.html` in your browser (via a local server or directly)
2. Click "SELECT ENEMY" to choose your challenge
3. Use Arrow keys or WASD to move
4. ESC to pause

## Gameplay

Eat food to grow longer and earn points. Each wave has a target number of food to collect before advancing. Boss waves occur every 5 waves with a powerful enemy to defeat.

### Controls
- **Arrow Keys / WASD** - Move the snake
- **SPACE** - Dash ability (unlocks at Level 3)
- **ESC** - Pause/Resume game

### Food Types

| Food | Emoji | Points | XP | Effect |
|------|-------|--------|-----|--------|
| Normal | Apple | 10 | 5 | None |
| Bonus | Orange | 25 | 12 | None |
| Super | Star | 50 | 25 | None |
| Power | Diamond | 30 | 15 | 5s invincibility |
| Speed | Lightning | 15 | 8 | 4s speed boost |
| Shrink | Leaf | 20 | 10 | Reduces length |
| Shield | Shield | 20 | 15 | Blocks one hit (Level 5+) |
| Magnet | Magnet | 15 | 12 | Attracts nearby food (Level 10+) |
| Double | Sparkles | 10 | 10 | 2x points for 8s (Level 15+) |
| Boss | Skull | 100 | 50 | Damages boss |

---

## RPG Progression

### XP & Leveling
- Earn XP from eating food (each type gives different XP)
- Earn bonus XP for completing waves (+20 XP per wave)
- Level up to unlock new abilities, power-ups, and skins
- Max level: 50

### Unlocks by Level

| Level | Unlock |
|-------|--------|
| 3 | Dash Ability |
| 5 | Shield Power-up |
| 10 | Magnet Power-up |
| 15 | Double Points Power-up |
| 20 | Golden Snake Skin |
| 30 | Neon Snake Skin |
| 40 | Fire Snake Skin |
| 50 | Cosmic Snake Skin |

### Abilities

**Dash (Level 3)**
- Press SPACE to dash forward 3 tiles
- Invincible during dash
- 8 second cooldown

### Coins
- Earn coins based on score and waves completed
- Formula: `floor(score / 10) + (wave * 5)`
- Used for future shop features

---

## Enemies & Worlds

Each enemy has a unique themed world with different grid sizes, backgrounds, and decorations. Slower enemies have smaller grids to keep gameplay engaging.

### Level Overview

| Enemy | World | Grid Size | Speed | Gimmick |
|-------|-------|-----------|-------|---------|
| Slime King | Slimy Swamp | 12x12 | Slow | Slime trails slow you |
| Speedy Scorpion | Scorching Desert | 16x16 | Fast | Speed/slow zones |
| Phantom Fox | Mystic Grove | 16x16 | Medium | Fake food traps |
| Ice Wizard | Frozen Peaks | 18x18 | Medium | Ice wall barriers |
| Thunder Tiger | Storm Valley | 18x18 | Fast | Lightning strikes |
| Shadow Serpent | Dark Hollow | 18x18 | Medium | Darkness zones |
| Mirror Mantis | Crystal Cavern | 18x18 | Fast | Control reversal |
| Gravity Gorilla | Boulder Mountain | 20x20 | Fast | Gravity well pulls |
| Chaos Chimera | Chaos Realm | 20x20 | Very Fast | Random gimmicks |
| Eternal Wyrm | Cosmic Void | 22x22 | Fastest | All mechanics |

---

## Enemy Details

### Slime King (Beginner)
**World:** Slimy Swamp (12x12)
- Leaves slime trails that slow you down
- Green swamp theme with lily pads and reeds
- Perfect for learning the basics

### Speedy Scorpion
**World:** Scorching Desert (16x16)
- Creates speed boost and slow zones
- Desert theme with cacti and rocks
- Fast-paced gameplay

### Phantom Fox
**World:** Mystic Grove (16x16)
- Spawns fake food that hurts you
- Mystical purple forest with mushrooms and wisps
- Tests your observation skills

### Ice Wizard
**World:** Frozen Peaks (18x18)
- Creates temporary ice wall barriers
- Icy blue theme with crystals and snow
- Navigate around obstacles

### Thunder Tiger
**World:** Storm Valley (18x18)
- Random lightning strikes on the board
- Stormy atmosphere with clouds
- Watch for warning indicators

### Shadow Serpent
**World:** Dark Hollow (18x18)
- Parts of the board go dark
- Deep purple/black theme with shadows
- Limited visibility challenge

### Mirror Mantis
**World:** Crystal Cavern (18x18)
- Occasionally reverses your controls
- Teal crystalline theme with mirrors and gems
- Mental agility required

### Gravity Gorilla
**World:** Boulder Mountain (20x20)
- Creates gravity wells that pull you
- Rocky gray theme with boulders
- Fight against the pull

### Chaos Chimera
**World:** Chaos Realm (20x20)
- Uses random gimmicks from all enemies
- Multi-colored chaotic theme with portals
- Expect the unexpected

### Eternal Wyrm (Final Boss)
**World:** Cosmic Void (22x22)
- Epic boss battle with all mechanics
- Deep space theme with stars and nebulae
- The ultimate challenge

---

## Status Effects

| Effect | Icon | Duration | Source |
|--------|------|----------|--------|
| Invincible | Diamond | 5s | Power food |
| Speed Boost | Lightning | 4s | Speed food or zones |
| Slowed | Snail | 2-3s | Slime or slow zones |
| Reversed | Arrows | 3s | Mirror Mantis |
| Shield | Shield | Until hit | Shield food (Level 5+) |
| Magnet | Magnet | 5s | Magnet food (Level 10+) |
| Double Points | Sparkles | 8s | Double food (Level 15+) |

---

## Wave System

- **Normal Waves:** Collect target food (starts at 5, increases each wave)
- **Boss Waves:** Every 5th wave, defeat the boss by collecting skull food
- **Speed Increase:** Game gets 5ms faster each wave (min 60ms)

### Boss Health Formula
```
Boss HP = 5 + (wave / 5) * 2
```
- Wave 5 Boss: 7 HP
- Wave 10 Boss: 9 HP
- Wave 15 Boss: 11 HP

---

## Scoring

- Points are earned by collecting food
- Different food types give different points
- High scores are tracked per enemy
- Stats saved to localStorage

---

## Technical Details

- Built with React 18
- In-browser JSX compilation with Babel
- All assets are emoji-based (no external images needed)
- Responsive grid sizing per level
- Themed CSS gradient backgrounds

### Files
- `snake.html` - Entry point
- `snake.jsx` - Game logic and React component

### localStorage Keys
- `snake_rpg_stats` - Player stats, high scores, games played

---

## Tips & Strategies

1. **Start with Slime King** - The 12x12 grid and slow pace make it perfect for beginners
2. **Watch for patterns** - Each enemy has predictable gimmick timing
3. **Use power-ups wisely** - Invincibility can save you from gimmicks
4. **Keep moving** - Standing still makes you vulnerable to hazards
5. **Learn the world** - Decorations are just visual, they won't hurt you
6. **Plan your path** - In larger grids, you have more space to maneuver
7. **Save your dash** - Use dash to escape tight situations or skip through hazards
8. **Shield is clutch** - One free hit can save a long run, prioritize shield pickups
9. **Magnet makes collection easy** - Food within 3 tiles is auto-collected
10. **Double points early** - Grab Double Points at the start of a wave for maximum effect

---

## Background Art Resources

The game uses CSS gradient backgrounds for each themed world. For those wanting to add custom pixel art backgrounds, these free resources are recommended:

- [OpenGameArt.org](https://opengameart.org/) - CC0 backgrounds and tilesets
- [itch.io Free Assets](https://itch.io/game-assets/free/tag-pixel-art) - Community pixel art
- [Kenney.nl](https://kenney.nl/) - Free game assets
- [GitHub Gamedev Resources](https://gist.github.com/benfrankel/5332a90d681506292e973eab4efa91e8) - Curated list of free assets
