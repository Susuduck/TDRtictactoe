# TOWER DEFENSE - WORLD GIMMICKS TODO

## Status: ALL GIMMICKS IMPLEMENTED

All world-specific gimmicks are now **active in gameplay**.

---

## World Gimmicks (COMPLETE)

| Status | World | Character | Gimmick | Description |
|--------|-------|-----------|---------|-------------|
| - | 1 | 🦌 Forest Fawn | *None* | Tutorial world - no gimmick intentionally |
| [x] | 2 | 🦂 Sandy Scorpion | **Sandstorm** | Every 20s for 5s: Reduces tower range by 40% |
| [x] | 3 | 🐧 Glacier Penguin | **Blizzard** | Every 20s for 5s: Slows tower attack speed by 60% |
| [x] | 4 | 🐸 Swamp Toad | **Fog Zones** | Every 4th path tile heals enemies 0.5% HP/frame |
| [x] | 5 | 🐉 Volcano Dragon | **Lava Eruption** | Random tiles erupt, disabling towers for 3s |
| [x] | 6 | 🦋 Crystal Moth | **Invisible** | 40% of enemies spawn invisible, revealed at close range |
| [x] | 7 | 🦅 Storm Eagle | **Lightning** | Random strikes damage enemies (30) and disable towers (2s) |
| [x] | 8 | 👻 Haunted Ghost | **Resurrect** | Enemies resurrect once at 50% HP when killed |
| [x] | 9 | 🤖 Clockwork Robot | **Time Warp** | Every 3rd path tile is a speed zone (2x enemy speed) |
| [x] | 10 | 🦉 Cosmic Owl | **Chaos** | Random gimmick from above selected each wave |

---

## Meta-Game Integration

| Priority | Task | Description |
|----------|------|-------------|
| [ ] | **Single-Session Mode** | For Teddy's Review Roundup integration - play one "run" when triggered, earn stars, return to main game |

---

## Implementation Details

### Gimmick Timing
- **Periodic gimmicks** (sandstorm, blizzard): 20-second cycle, active for 5 seconds
- **Random events** (lightning, lava): Probability-based per frame
- **Constant effects** (fog, timewarp, invisible, resurrect): Always active in respective worlds
- **Chaos**: Picks random gimmick at wave start via `chaosGimmickRef`

### Key Code Locations
- **Gimmick cycle logic**: Lines ~1150-1170 in game loop
- **effectiveGimmick variable**: Handles chaos world by checking `chaosGimmickRef`
- **Tower modifiers**: Lines ~1475 (rangeMultiplier, attackSpeedMultiplier)
- **Enemy effects**: Lines ~1405-1420 (timewarp, fog)
- **Resurrect logic**: Lines ~1315 in enemy death handling
- **Invisible targeting**: Lines ~1540-1550 in tower targeting

### Visual Feedback
- Sandstorm/Blizzard: Announcement text when active
- Lightning: Yellow flash + particles
- Lava: "🌋 ERUPTION!" floating text + orange particles
- Resurrect: "👻 RISEN!" text + purple particles
- Invisible reveal: "👁️ REVEALED!" text
- Chaos: "🎲 CHAOS: [gimmick]!" announcement at wave start

---

## File Locations

- **Tower Defense**: `/tower-defense.html`
- **World Definitions**: Lines ~57-192 (worldDefs, bossDefs)
- **Progression Storage**: Lines ~208-264 (ProgressionStorage)

---

*Last updated: Gimmicks implementation session*
