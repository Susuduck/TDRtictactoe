# TOWER DEFENSE - WORLD GIMMICKS TODO

## Status: NOT YET IMPLEMENTED

These world-specific gimmicks are **defined in the code** but **not yet active in gameplay**.

---

## World Gimmicks To Implement

| Priority | World | Character | Gimmick | Description |
|----------|-------|-----------|---------|-------------|
| - | 1 | 🦌 Forest Fawn | *None* | Tutorial world - no gimmick intentionally |
| [ ] | 2 | 🦂 Sandy Scorpion | **Sandstorm** | Periodically reduces all tower ranges |
| [ ] | 3 | 🐧 Glacier Penguin | **Blizzard** | Slows tower attack speed |
| [ ] | 4 | 🐸 Swamp Toad | **Fog Zones** | Certain path areas heal enemies |
| [ ] | 5 | 🐉 Volcano Dragon | **Lava Eruption** | Random tiles erupt, damaging/disabling towers |
| [ ] | 6 | 🦋 Crystal Moth | **Invisible** | Some enemies invisible until revealed |
| [ ] | 7 | 🦅 Storm Eagle | **Lightning** | Random lightning strikes damage towers/enemies |
| [ ] | 8 | 👻 Haunted Ghost | **Resurrect** | Enemies come back once at 50% HP |
| [ ] | 9 | 🤖 Clockwork Robot | **Time Warp** | Speed zones on path (enemies move faster) |
| [ ] | 10 | 🦉 Cosmic Owl | **Chaos** | Random gimmick from above each wave |

---

## Meta-Game Integration

| Priority | Task | Description |
|----------|------|-------------|
| [ ] | **Single-Session Mode** | For Teddy's Review Roundup integration - play one "run" when triggered, earn stars, return to main game |

---

## Implementation Notes

### Where gimmicks are defined:
- `worldDefs` array in `tower-defense.html` (lines ~57-192)
- Each world has a `gimmick` property (e.g., `'sandstorm'`, `'blizzard'`)
- Currently these values are stored but not acted upon

### Where to implement:
- Main game loop (`useEffect` with `gameState === 'playing'`)
- Add gimmick check/application per wave or per tick
- Use `activeGimmick` state (already defined) to track current effect

### Reference:
- See Ultimate Tic-Tac-Toe (`ultimate-tictactoe-v3.jsx`) for similar gimmick pattern
- Each character there has unique mini-games triggered on intervals

---

## File Locations

- **Tower Defense**: `/tower-defense.html`
- **World Definitions**: Lines ~57-192 (worldDefs, bossDefs)
- **Progression Storage**: Lines ~208-264 (ProgressionStorage)

---

*Last updated: Session implementing 10-world structure*
