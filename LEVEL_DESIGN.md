# Teddyball Level Design Document

## Overview

100 levels across 10 worlds (enemies), each with 10 levels.
Features are introduced gradually to teach players mechanics before combining them.

---

## Feature Introduction Schedule

| Feature | Introduced | Mastered By | Notes |
|---------|------------|-------------|-------|
| Basic bricks (1-3 hit) | Level 1 | Level 5 | Core mechanic |
| Indestructible blocks (#) | Level 3 | Level 10 | Creates puzzle elements |
| Powerup bricks (*) | Level 2 | Level 10 | Rewards |
| Explosive bricks (X) | Level 6 | Level 15 | Chain reactions |
| **Bumpers (O)** | Level 11 | Level 25 | First pinball element |
| **Portals (@ pairs)** | Level 21 | Level 40 | Teleportation |
| **Spawners (S)** | Level 31 | Level 50 | Threat generators |
| Enemies (moving) | Level 1 | Ongoing | Scale with difficulty |

---

## World Breakdown

### World 1: Brick Goblin (Levels 1-10)
**Theme:** Learning the basics
**New Features:** Basic bricks, powerups, indestructibles, explosives

| Level | Layout | Features | Design Goal |
|-------|--------|----------|-------------|
| 1 | Welcome Bars | 1-2 hit bricks only | Learn to play |
| 2 | Arrow | Powerup brick intro | Learn powerups exist |
| 3 | Heart | First indestructible | Learn some blocks don't break |
| 4 | Diamond | Mixed brick strengths | Practice aim |
| 5 | Simple Face | Patterns matter | Recognize shapes |
| 6 | Castle | First explosive | Learn chain reactions |
| 7 | Goblin | Complex shape | Precision required |
| 8 | Zigzag | Indestructible maze | Navigate obstacles |
| 9 | Fortress | Heavy defenses | Endurance test |
| 10 | Boss: Goblin King | All basics combined | Prove mastery |

---

### World 2: Magnet Mage (Levels 11-20)
**Theme:** Introducing bumpers
**New Features:** Bumpers (O)

| Level | Layout | Features | Design Goal |
|-------|--------|----------|-------------|
| 11 | Magnetic Poles | 2 bumpers (tutorial) | Learn bumpers bounce ball |
| 12 | Horseshoe | Bumper in center | Use bumper strategically |
| 13 | Orbit | Ring of bumpers | Chaos and points |
| 14 | Figure-8 | Bumpers guide path | Bumpers as tools |
| 15 | Field Lines | Bumper clusters | Multi-bounce combos |
| 16 | Repulsion | Bumpers protect bricks | Bumpers as obstacles |
| 17 | Spiral | Bumper spiral | Navigate the spin |
| 18 | Atom | Orbiting bumper pattern | Precision through chaos |
| 19 | Maze | Bumper maze | Master bumper physics |
| 20 | Boss: Mage Core | Dense bumper field | Bumper mastery test |

---

### World 3: Wind Witch (Levels 21-30)
**Theme:** Introducing portals
**New Features:** Portal pairs (@)

| Level | Layout | Features | Design Goal |
|-------|--------|----------|-------------|
| 21 | Breeze | 1 portal pair (obvious) | Learn portals teleport |
| 22 | Crosswind | Portal skips obstacle | Portals as shortcuts |
| 23 | Double Wave | 2 portal pairs | Multiple teleport options |
| 24 | Tornado | Portal in center | Strategic repositioning |
| 25 | Swirl | Portals + bumpers | Combine mechanics |
| 26 | Cloud | Hidden portal destination | Prediction required |
| 27 | Lightning | Fast portal chains | Quick reactions |
| 28 | Gusts | 3 portal pairs | Complex routing |
| 29 | Storm | Portals + bumpers + obstacles | Full chaos |
| 30 | Boss: Eye of Storm | Portal maze | Portal mastery test |

---

### World 4: Shadow Smith (Levels 31-40)
**Theme:** Introducing spawners
**New Features:** Enemy spawners (S)

| Level | Layout | Features | Design Goal |
|-------|--------|----------|-------------|
| 31 | Shadows | 1 spawner (weak) | Learn spawners create enemies |
| 32 | Dark Corridor | Spawner behind wall | Must break through |
| 33 | Chamber | 2 spawners | Prioritize targets |
| 34 | Forge | Spawner + bumpers | Combo mechanics |
| 35 | Anvil | Protected spawner | Strategic destruction |
| 36 | Crossed Swords | Spawners + portals | Use portals to reach |
| 37 | Dungeon | 3 spawners | Overwhelming if ignored |
| 38 | Labyrinth | Spawner maze | Navigate and destroy |
| 39 | Void | Hidden spawners | Find and eliminate |
| 40 | Boss: Dark Forge | Spawner fortress | Spawner mastery test |

---

### World 5: Fire Phoenix (Levels 41-50)
**Theme:** Combining all features
**New Features:** All mechanics combined, explosive chains

| Level | Layout | Features | Design Goal |
|-------|--------|----------|-------------|
| 41 | Embers | Review basics | Warm up |
| 42 | Flames | Bumpers + explosives | Chain reaction combos |
| 43 | Fireball | Portals + explosives | Teleport to trigger |
| 44 | Candles | Multiple spawners | Manage threats |
| 45 | Wings | All features light | Full toolkit |
| 46 | Inferno | Dense everything | Intensity ramp |
| 47 | Phoenix | Complex phoenix shape | Precision + features |
| 48 | Fire Maze | Spawners + portals + bumpers | Navigate chaos |
| 49 | Volcano | Maximum features | Pre-boss challenge |
| 50 | Boss: Rebirth | Everything at once | Midgame mastery |

---

### World 6: Frost Fairy (Levels 51-60)
**Theme:** Defensive layouts, patience
**Twist:** Freeze paddle gimmick makes timing crucial

| Level | Layout | Features | Design Goal |
|-------|--------|----------|-------------|
| 51 | Snowflake | Symmetrical bumpers | Patience with freeze |
| 52 | Ice Wall | Thick defenses | Chip away |
| 53 | Frozen Lake | Portal across gap | Timing with freeze |
| 54 | Icicles | Vertical spawner column | Prioritize while frozen |
| 55 | Glacier | Slow, dense layout | Endurance |
| 56 | Blizzard | Many small threats | Manage chaos frozen |
| 57 | Ice Castle | All features, defensive | Strategic frozen play |
| 58 | Permafrost | Indestructible heavy | Limited paths |
| 59 | Absolute Zero | Maximum freeze challenge | Near-impossible timing |
| 60 | Boss: Fairy Queen | Freeze + everything | Patience mastery |

---

### World 7: Time Tortoise (Levels 61-70)
**Theme:** Speed and timing
**Twist:** Slow time gimmick changes portal/bumper timing

| Level | Layout | Features | Design Goal |
|-------|--------|----------|-------------|
| 61 | Sundial | Bumper clock pattern | Use slow time |
| 62 | Hourglass | Portal timing puzzle | Slow to solve |
| 63 | Pendulum | Swinging bumper line | Rhythm |
| 64 | Clockwork | Interlocking features | Mechanical precision |
| 65 | Time Loop | Portal cycle | Repeating patterns |
| 66 | Rewind | Spawners + time | Manage with slow |
| 67 | Fast Forward | Speed challenge | Quick reactions |
| 68 | Temporal Maze | Complex timing | Everything slowed |
| 69 | Paradox | Contradictory layout | Brain teaser |
| 70 | Boss: Eternal | Time mastery test | Speed + patience |

---

### World 8: Void Vampire (Levels 71-80)
**Theme:** Darkness and surprise
**Twist:** Invisible bricks + dark theme

| Level | Layout | Features | Design Goal |
|-------|--------|----------|-------------|
| 71 | Dusk | Some invisible | Learn to probe |
| 72 | Shadows | Hidden spawner | Find threats |
| 73 | Nightfall | Invisible + portals | Blind teleport |
| 74 | Darkness | Many invisible | Memory game |
| 75 | Blood Moon | Red bumpers visible | Contrast |
| 76 | Coffin | Hidden defenses | Excavate |
| 77 | Crypt | Invisible maze | Navigate blind |
| 78 | Void | Almost all hidden | Ultimate probe |
| 79 | Abyss | Everything hidden | Pure skill |
| 80 | Boss: Count | Reveal mechanic test | Vision mastery |

---

### World 9: Thunder Titan (Levels 81-90)
**Theme:** Intensity and overwhelm
**Twist:** Random bounces + speed = chaos

| Level | Layout | Features | Design Goal |
|-------|--------|----------|-------------|
| 81 | Static | Many bumpers | Chaos intro |
| 82 | Lightning | Portal chains | Fast transport |
| 83 | Thunder | Spawner storm | Enemy flood |
| 84 | Bolt | Explosive chains | Destruction |
| 85 | Storm Front | All features rapid | Speed test |
| 86 | Cyclone | Circular chaos | Dizzying |
| 87 | Supercell | Maximum spawners | Survival |
| 88 | Megastorm | Everything intense | Endurance |
| 89 | Apocalypse | Near impossible | Skill ceiling |
| 90 | Boss: Titan | Ultimate chaos | Chaos mastery |

---

### World 10: Chaos Champion (Levels 91-100)
**Theme:** Victory lap / ultimate challenge
**Twist:** Random gimmicks, all mechanics maxed

| Level | Layout | Features | Design Goal |
|-------|--------|----------|-------------|
| 91 | Champion's Gate | Review level | Warm up |
| 92 | Gauntlet | Linear challenge | One-shot run |
| 93 | Arena | Open battle | Fight everything |
| 94 | Colosseum | Spectacle | Show off skills |
| 95 | Throne Room | Defensive palace | Break through |
| 96 | War | Maximum enemies | Survival |
| 97 | Conquest | Take territories | Strategic |
| 98 | Domination | Near-impossible | For the best |
| 99 | Perfection | Flawless required | Mastery |
| 100 | Boss: CHAOS | EVERYTHING | Ultimate test |

---

## Feature Specifications

### Bumpers (O)
- **Size:** 32x32 pixels (circular)
- **Behavior:** Ball bounces off with increased velocity
- **Points:** +25 per hit (active), +10 (inactive)
- **Visual:** Glows when hit, pulses when active
- **Activation:** Hit all bumpers in level to activate bonus mode

### Portals (@)
- **Size:** 40x40 pixels
- **Behavior:** Ball enters, exits paired portal with same velocity (direction adjusted)
- **Pairs:** Color-coded (blue/orange, green/purple, red/yellow)
- **Visual:** Swirling animation, glow intensifies when ball approaches
- **Limit:** Max 4 pairs per level

### Spawners (S)
- **Size:** 48x48 pixels
- **Health:** 3-5 hits depending on level
- **Behavior:** Spawns enemy every 5-8 seconds until destroyed
- **Visual:** Cave/door themed to world, shakes and reddens on hit
- **Priority:** High - should be destroyed early
- **Placement:** Walls, corners, or replacing brick positions

---

## Brick Legend (Updated)

```
. = Empty
1 = 1-hit brick
2 = 2-hit brick
3 = 3-hit brick
# = Indestructible obstacle
* = Powerup brick
X = Explosive brick
O = Bumper
@ = Portal (pairs: @1/@1, @2/@2, @3/@3, @4/@4)
S = Spawner
```

---

## Difficulty Curve

```
Difficulty
    ^
100%|                                    ****
    |                               *****
    |                          *****
 75%|                     *****
    |                *****
    |           *****
 50%|       ****
    |    ***
    |  **
 25%| *
    |*
    +----------------------------------------> Level
     1   10   20   30   40   50   60   70   80   90  100

     |Basics|Bump|Portal|Spawn|Combo|Frost|Time|Void|Thunder|CHAOS|
```

---

## Design Principles

1. **Teach then test** - Introduce feature simply, then challenge with it
2. **One new thing at a time** - Don't overwhelm with multiple new mechanics
3. **Combine gradually** - Mix learned features before adding new ones
4. **Boss = mastery check** - Level 10 of each world tests that world's feature
5. **Difficulty spikes at X1** - Each new world starts slightly easier to teach
6. **World 5 = midpoint** - Everything combined, prepare for second half
7. **Worlds 6-10 = mastery** - Twists on learned mechanics, not new features
