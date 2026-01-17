# Honey Fishing

A complete fishing mini-game with four distinct gameplay phases.

## How to Play

### Gameplay Phases

1. **Cast Phase**: A power meter moves back and forth. Press SPACE or tap to set your cast distance.
   - Shallow (0-40%): Smaller fish like Minnows and Bass
   - Medium (40-70%): Better fish like Trout and Salmon
   - Deep (70-100%): Rare fish like Catfish and Pike

2. **Wait Phase**: Your bobber sits in the water. Wait patiently for a fish to bite.
   - Bite times vary from 3-15 seconds depending on opponent

3. **Hook Phase**: When "!" appears, quickly press SPACE or tap to hook the fish!
   - Timing window gets tighter with harder opponents
   - Miss the window and you lose your cast

4. **Reel Phase**: Balance tension while reeling in the fish.
   - Tap rhythmically to reel in
   - Keep tension in the green zone (20-80%)
   - Too low tension: Line snaps!
   - Too high tension: Fish escapes!

### Fish Types

| Fish | Points | Depth |
|------|--------|-------|
| Minnow | 1 | Shallow |
| Bass | 2 | Shallow |
| Rainbow Trout | 3 | Medium |
| Salmon | 4 | Medium |
| Catfish | 5 | Deep |
| Northern Pike | 6 | Deep |
| Golden Fish | 10 | Any (rare) |

### Opponents

Each opponent introduces unique fishing mechanics:

1. **Funky Frog** - Basic fishing, learn the rhythm
2. **Cheeky Chicken** - Faster bites, be ready!
3. **Disco Dinosaur** - Rhythm reeling, tap on the beat
4. **Radical Raccoon** - More junk items, watch out!
5. **Electric Eel** - Tension surges, manage the spikes
6. **Mysterious Moth** - Hidden depth gauge, feel the distance
7. **Professor Penguin** - Precise casting required
8. **Sly Snake** - Fish can escape, reel fast!
9. **Wolf Warrior** - Aggressive fish, high tension battles
10. **Grand Master Grizzly** - All challenges combined!

### Progression System

- 5 casts per round
- Catch fish to earn points
- Meet the target score to earn star points
- 4 points = 1 star
- 40 points (10 stars) = Master an opponent
- Master an opponent to unlock the next one
- 10 levels per opponent with increasing difficulty

### Controls

- **SPACE / Enter / Click / Tap**: Perform action (cast, hook, reel)
- **ESC**: Return to menu

### Technical Details

- Built with React 18
- Progress saved to localStorage (`fishing_progression_v1`)
- Theme color: Dodger Blue (#1e90ff)
