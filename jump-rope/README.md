# Jump Rope - Skip Teddy (Enhanced Edition)

## Overview
A rhythm-based jumping game inspired by professional rhythm games like Guitar Hero, Beat Saber, and osu!. Time your taps to the beat as rings approach the center. Each opponent introduces unique rhythm challenges with progressive difficulty.

## Enhanced Features (v2)
- **Beat Approach System**: Visual rings shrink toward center - tap when they align!
- **Input Buffering**: Early taps are remembered and applied when timing is right
- **Miss Tolerance**: Multiple chances before game over (varies by opponent)
- **Combo System**: Build multipliers for higher scores
- **3-Second Countdown**: Time to prepare before each level
- **Tiered Timing**: Perfect/Great/Good ratings with color feedback
- **Encouraging Messages**: Celebration for combos and perfect hits
- **Progressive Difficulty**: 3 tiers per opponent (Learning/Building/Mastery)

## Design Philosophy
- **Clear Anticipation**: See beats approaching, know exactly when to act
- **Forgiving Early Game**: Generous timing windows that tighten gradually
- **Rewarding Mastery**: Perfect timing gives best scores and feels satisfying
- **Positive Feedback**: Combos, grades, and encouraging messages keep you motivated

## How to Play
1. Watch the rings approach the center circle
2. TAP when the ring reaches the center (turns cyan for PERFECT!)
3. Build combos for score multipliers
4. Don't run out of lives!

## Controls
- **SPACE / Arrow Up**: Jump
- **Click/Touch**: Jump (on game area only)
- **ESC**: Return to menu

## Timing Ratings
| Rating | Color | Points | Description |
|--------|-------|--------|-------------|
| PERFECT | Cyan | 100 | Within ~50-80ms |
| GREAT | Green | 75 | Within ~100-150ms |
| GOOD | Yellow | 50 | Within ~150-250ms |
| MISS | Red | 0 | Too early or late |

## Rhythm Masters

| Opponent | BPM Range | Special Mechanic | Misses Allowed |
|----------|-----------|------------------|----------------|
| Funky Frog | 55-75 | Steady rhythm - perfect for learning | 5 |
| Cheeky Chicken | 60-85 | Perfect hits count as 2 jumps! | 4 |
| Disco Dinosaur | 65-110 | Speed gradually increases | 4 |
| Radical Raccoon | 70-95 | Some beats are syncopated (off-rhythm) | 4 |
| Electric Eel | 70-100 | Yellow markers = tap twice quickly! | 3 |
| Mysterious Moth | 75-100 | Visual guides fade - trust the rhythm | 3 |
| Professor Penguin | 75-105 | Red markers = DON'T jump! | 3 |
| Sly Snake | 80-115 | Tempo shifts unexpectedly | 3 |
| Wolf Warrior | 70-100 | Double Dutch - alternating rope patterns | 2 |
| Grand Master Grizzly | 85-130 | ALL challenges combined! | 2 |

## Level Progression
Each opponent has 10 levels across 3 difficulty tiers:

### Learning (Levels 1-3)
- Extra misses allowed
- Larger timing windows
- Slower BPM
- Fewer target jumps

### Building (Levels 4-6)
- Standard misses
- Normal timing windows
- Moderate BPM increase
- More target jumps

### Mastery (Levels 7-10)
- Reduced misses allowed
- Tight timing windows
- Maximum BPM
- Many target jumps

## Scoring System
- **Base Points**: 100 (Perfect), 75 (Great), 50 (Good)
- **Combo Multiplier**: +10% every 10 combo (1.1x at 10, 1.2x at 20, etc.)
- **Double Jump Bonus**: +50 points for second tap
- **Grade**: S (95%+), A (85%+), B (70%+), C (50%+), D (<50%)

## Special Marker Types
- **Pink Ring**: Standard jump
- **Yellow Ring (x2)**: Double tap - hit once, then quickly tap again!
- **Red Ring (X)**: DON'T jump! Let it pass
- **Green Ring**: Second rope (Double Dutch)

## Tips for Success
1. **Focus on the center** - Don't watch the outer rings, watch where they're going
2. **Listen to the audio** - Each timing rating has a different sound
3. **Tap early rather than late** - Input buffering helps early taps
4. **Learn patterns** - Special mechanics follow predictable patterns
5. **Build combos** - Staying consistent multiplies your score
6. **Use the countdown** - 3 seconds to find your rhythm before starting
7. **Practice blind mode** - Close your eyes and feel the beat

## Why This Game is Fun
- **Satisfying Feedback**: Every hit feels responsive with sound + visuals
- **Fair Challenge**: Miss tolerance means one mistake doesn't end everything
- **Clear Progress**: See rings approaching, know exactly when to act
- **Rewarding Mastery**: Perfect timings look and feel amazing
- **Combo Flow**: Building streaks creates engagement and excitement
- **Gradual Difficulty**: Each level builds on your skills naturally
