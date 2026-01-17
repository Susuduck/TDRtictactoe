# Honey Grid

## Overview
A Voltorb Flip-style deduction puzzle game where you flip tiles to multiply your score while avoiding traps. Use row and column hints to deduce which tiles are safe!

## How to Play
1. **Select an Opponent**: Choose from 10 unlockable opponents
2. **Choose a Level**: Each opponent has 10 levels of increasing difficulty
3. **Flip Tiles**: Click tiles to reveal them
4. **Multiply Score**: x2 and x3 tiles multiply your current score
5. **Avoid Traps**: ! tiles reset your score to 0 and end the round
6. **Win**: Flip all multiplier tiles (x2 and x3) without hitting a trap

## Controls
- **Left Click**: Flip a tile
- **Right Click**: Mark tile as safe (?) or trap (X)
- **SPACE**: Cash out and keep your current score
- **ESC**: Return to previous screen

## Understanding Hints
Each row and column has a hint box showing:
- **Top Number**: Sum of all multipliers in that row/column
- **Bottom Symbol**: Number of traps (! = 1 trap, !! = 2 traps, etc.)
- **SAFE**: Green border means 0 traps in that row/column

### Hint Examples
- Sum: 5, Traps: 0 = Could be five x1 tiles, or x2+x1+x1+x1, etc.
- Sum: 8, Traps: 2 = High value tiles mixed with traps
- Sum: 3, Traps: 3 = Only x1 tiles and traps - skip this row!

## Scoring System
- **Perfect Clear (all multipliers)**: +4 Points
- **Cash Out (score >= 8)**: +2 Points
- **Cash Out (score >= 4)**: +1 Point
- **Hit Trap**: +0 Points
- **4 Points = 1 Star**
- **40 Points (10 Stars) = Opponent Mastered**

## Tile Values
| Tile | Effect |
|------|--------|
| x1 | Score unchanged |
| x2 | Score doubled |
| x3 | Score tripled |
| ! | TRAP - Score = 0, round ends |

## Opponents

| # | Name | Challenge |
|---|------|-----------|
| 1 | Funky Frog | Few traps - learn the basics! |
| 2 | Cheeky Chicken | x3 multipliers appear! |
| 3 | Disco Dinosaur | More traps to dodge! |
| 4 | Radical Raccoon | Fuzzy hints - sums shown as ranges |
| 5 | Electric Eel | Some hints are hidden! |
| 6 | Mysterious Moth | Traps cluster together! |
| 7 | Professor Penguin | Dense grids with x3 tiles! |
| 8 | Sly Snake | Traps form diagonal lines! |
| 9 | Wolf Warrior | Heavy trap density! |
| 10 | Grand Master Grizzly | Master challenge - all mechanics! |

## Strategy Tips
1. **Start with 0-trap rows/columns**: These are always safe to flip
2. **Mark tiles**: Use right-click to track your deductions
3. **Calculate possibilities**: If a row has sum 6 with 2 traps, the remaining 3 tiles must sum to 6
4. **Skip x1-only rows**: If sum equals (5 - traps), all non-trap tiles are x1
5. **Cash out wisely**: Sometimes 8 points is better than risking 0
6. **Look for forced moves**: If only one tile can have a multiplier, it's safe

## Difficulty Scaling
- **Opponent 1**: ~15% trap density, clear hints
- **Opponent 10**: ~28% trap density, fuzzy/hidden hints, all mechanics

Each level within an opponent increases trap density slightly.

## Progression
- Beat levels to earn stars
- Earn 10 stars on an opponent to unlock the next one
- Earn 40 points total on an opponent to "Master" them
